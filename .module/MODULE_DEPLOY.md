# MODULE_DEPLOY.md - イキイキレコード デプロイ仕様

## デプロイ概要

イキイキレコードのデプロイ戦略は、開発環境から本番環境までの一貫したデプロイプロセスを提供します。コンテナ化、Kubernetesオーケストレーション、CI/CDパイプライン、監視体制を含む包括的なデプロイ仕様を定義します。

## デプロイ定義

### DEPLOY_01_01_01-001: データ生成デプロイ
**対応目標**: GOAL_01_01_01-001
**対応タスク**: TASK_01_01_01-001
**対応アーキテクチャ**: ARCH_01_01_01-001
**対応構造**: STRUCT_01_01_01-001
**対応挙動**: BEHAV_01_01_01-001
**対応実装**: IMPL_01_01_01-001
**対応テスト**: TEST_01_01_01-001

**コンテナ化**:
```dockerfile
# Dockerfile.data-generator
FROM node:18-alpine AS base

# 依存関係のインストール
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# ソースコードのコピー
COPY . .

# ビルド
FROM base AS builder
RUN npm run build:data-generator

# 実行環境
FROM node:18-alpine AS runner
WORKDIR /app

# 非rootユーザーの作成
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# アプリケーションのコピー
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# ヘルスチェック
COPY --chown=nextjs:nodejs scripts/health-check.sh ./scripts/
RUN chmod +x ./scripts/health-check.sh

USER nextjs

EXPOSE 3001

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD ./scripts/health-check.sh

CMD ["node", "dist/data-generator/index.js"]
```

**Kubernetesマニフェスト**:
```yaml
# deployment/kubernetes/data-generator-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: data-generator
  labels:
    app: ikiiki-record
    component: data-generator
    version: v1
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: ikiiki-record
      component: data-generator
  template:
    metadata:
      labels:
        app: ikiiki-record
        component: data-generator
        version: v1
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3001"
        prometheus.io/path: "/metrics"
    spec:
      containers:
      - name: data-generator
        image: ikiiki-record/data-generator:latest
        imagePullPolicy: Always
        ports:
        - name: http
          containerPort: 3001
          protocol: TCP
        env:
        - name: NODE_ENV
          value: "production"
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: ikiiki-secrets
              key: REDIS_URL
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: ikiiki-secrets
              key: DATABASE_URL
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: http
            scheme: HTTP
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
          successThreshold: 1
        readinessProbe:
          httpGet:
            path: /ready
            port: http
            scheme: HTTP
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
          successThreshold: 1
        volumeMounts:
        - name: cache
          mountPath: /app/cache
        - name: logs
          mountPath: /app/logs
      volumes:
      - name: cache
        emptyDir:
          sizeLimit: 500Mi
      - name: logs
        emptyDir:
          sizeLimit: 100Mi
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        runAsGroup: 1001
        fsGroup: 1001
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: false
        capabilities:
          drop:
          - ALL
      terminationGracePeriodSeconds: 30

---
apiVersion: v1
kind: Service
metadata:
  name: data-generator-service
  labels:
    app: ikiiki-record
    component: data-generator
spec:
  type: ClusterIP
  ports:
  - name: http
    port: 80
    targetPort: http
    protocol: TCP
  selector:
    app: ikiiki-record
    component: data-generator

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: data-generator-hpa
  labels:
    app: ikiiki-record
    component: data-generator
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: data-generator
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
```

### DEPLOY_01_01_02-002: 可視化デプロイ
**対応目標**: GOAL_01_01_02-002
**対応タスク**: TASK_01_01_02-002
**対応アーキテクチャ**: ARCH_01_01_02-002
**対応構造**: STRUCT_01_01_02-002
**対応挙動**: BEHAV_01_01_02-002
**対応実装**: IMPL_01_01_02-002
**対応テスト**: TEST_01_01_02-002

**コンテナ化**:
```dockerfile
# Dockerfile.visualization
FROM node:18-alpine AS base

# 依存関係のインストール
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# ソースコードのコピー
COPY . .

# ビルド
FROM base AS builder
RUN npm run build:visualization

# Nginx設定
FROM nginx:alpine AS nginx-config
COPY deployment/nginx/visualization.conf /etc/nginx/nginx.conf
COPY deployment/nginx/mime.types /etc/nginx/mime.types

# 実行環境
FROM nginx:alpine AS runner

# 静的ファイルのコピー
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=nginx-config /etc/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=nginx-config /etc/nginx/mime.types /etc/nginx/mime.types

# ヘルスチェック用スクリプト
COPY deployment/scripts/health-check.sh /scripts/
RUN chmod +x /scripts/health-check.sh

EXPOSE 80

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD /scripts/health-check.sh

CMD ["nginx", "-g", "daemon off;"]
```

**Nginx設定**:
```nginx
# deployment/nginx/visualization.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # ログ形式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'rt=$request_time uct="$upstream_connect_time" '
                    'uht="$upstream_header_time" urt="$upstream_response_time"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # 基本設定
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;

    # Gzip圧縮
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # セキュリティヘッダー
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'self';" always;

    # アップストリーム
    upstream visualization_backend {
        server visualization-service:80;
        keepalive 32;
    }

    server {
        listen 80;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;

        # ヘルスチェック
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # 静的ファイルのキャッシュ
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header Vary Accept-Encoding;
        }

        # HTMLファイルのキャッシュ
        location ~* \.html$ {
            expires 1h;
            add_header Cache-Control "public, must-revalidate";
        }

        # APIプロキシ
        location /api/ {
            proxy_pass http://visualization_backend/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 300s;
            proxy_connect_timeout 75s;
        }

        # WebSocketサポート
        location /ws/ {
            proxy_pass http://visualization_backend/ws/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 86400s;
            proxy_send_timeout 86400s;
        }

        # SPAルーティング
        location / {
            try_files $uri $uri/ /index.html;
        }

        # セキュリティ設定
        location ~ /\. {
            deny all;
        }

        location ~ ~$ {
            deny all;
        }
    }
}
```

### DEPLOY_01_01_03-003: レスポンシブデプロイ
**対応目標**: GOAL_01_01_03-003
**対応タスク**: TASK_01_01_03-003
**対応アーキテクチャ**: ARCH_01_01_03-003
**対応構造**: STRUCT_01_01_03-003
**対応挙動**: BEHAV_01_01_03-003
**対応実装**: IMPL_01_01_03-003
**対応テスト**: TEST_01_01_03-003

**CDN設定**:
```yaml
# deployment/cloudfront/cloudfront.yaml
Resources:
  ResponsiveCDN:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Origins:
          - Id: S3Origin
            DomainName: !GetAtt S3Bucket.DomainName
            S3OriginConfig:
              OriginAccessIdentity: !Sub 'origin-access-identity/cloudfront/${AWS::StackName}'
        - Id: APIOrigin
            DomainName: !GetAtt APIGateway.DomainName
            CustomOriginConfig:
              HTTPPort: 443
              HTTPSPort: 443
              OriginProtocolPolicy: https-only
              OriginSSLProtocols:
                - TLSv1.2
                - TLSv1.3

        DefaultCacheBehavior:
          TargetOriginId: S3Origin
          ViewerProtocolPolicy: redirect-to-https
          AllowedMethods:
            - GET
            - HEAD
            - OPTIONS
          CachedMethods:
            - GET
            - HEAD
          Compress: true
          ForwardedValues:
            QueryString: false
            Cookies:
              Forward: none
            Headers:
              - Origin
              - Access-Control-Request-Method
              - Access-Control-Request-Headers
          MinTTL: 0
          MaxTTL: 31536000
          DefaultTTL: 86400

        CacheBehaviors:
          - PathPattern: '/api/*'
            TargetOriginId: APIOrigin
            ViewerProtocolPolicy: https-only
            AllowedMethods:
              - GET
              - HEAD
              - POST
              - PUT
              - DELETE
              - OPTIONS
            CachedMethods:
              - GET
              - HEAD
            Compress: true
            ForwardedValues:
              QueryString: true
              Headers:
                - Authorization
                - Content-Type
                - X-API-Key
            MinTTL: 0
            MaxTTL: 3600
            DefaultTTL: 300

        Enabled: true
        HttpVersion: http2
        PriceClass: PriceClass_100

        # レスポンシブ画像最適化
        DefaultRootObject: index.html
        CustomErrorResponses:
          - ErrorCode: 404
            ResponseCode: 200
            ResponsePagePath: /index.html
            ErrorCachingMinTTL: 300

        # セキュリティ設定
        ViewerCertificatePolicy: https-only
        SecurityPolicy:
          FrameOption: DENY
          ContentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'self';"
          ContentTypeOptions: true
          ReferrerPolicy: no-referrer-when-downgrade
          XSSProtection: true
          StrictTransportSecurity:
            AccessControlMaxAge: 63072000
            IncludeSubdomains: true
            Preload: true

        # 地理的制限
        Restrictions:
          GeoRestriction:
            RestrictionType: whitelist
            Locations:
              - JP
              - US
              - CA
              - AU
              - GB
              - DE
              - FR

        # WAF統合
        WebACLId: !Ref ResponsiveWAF
```

**Service Worker**:
```javascript
// public/sw.js
const CACHE_NAME = 'ikiiki-responsive-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/offline.html',
  // クリティカルな静的リソース
  '/static/css/main.css',
  '/static/js/main.js',
  // レスポンシブ画像
  '/images/icons/icon-72x72.png',
  '/images/icons/icon-96x96.png',
  '/images/icons/icon-128x128.png',
  '/images/icons/icon-144x144.png',
  '/images/icons/icon-152x152.png',
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-384x384.png',
  '/images/icons/icon-512x512.png'
];

// インストールイベント
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// フェッチイベント（オフライン対応）
self.addEventListener('fetch', (event) => {
  // GETリクエストのみキャッシュ
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュにあればそれを返す
        if (response) {
          return response;
        }

        // ネットワークリクエスト
        return fetch(event.request)
          .then((response) => {
            // レスポンスが有効であればキャッシュ
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // レスポンスのクローンを作成してキャッシュ
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // オフライン時のフォールバック
            if (event.request.destination === 'document') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// アクティベートイベント
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

### DEPLOY_01_01_04-004: クリーンアーキテクチャデプロイ
**対応目標**: GOAL_01_01_04-004
**対応タスク**: TASK_01_01_04-004
**対応アーキテクチャ**: ARCH_01_01_04-004
**対応構造**: STRUCT_01_01_04-004
**対応挙動**: BEHAV_01_01_04-004
**対応実装**: IMPL_01_01_04-004
**対応テスト**: TEST_01_01_04-004

**マイクロサービスアーキテクチャ**:
```yaml
# deployment/kubernetes/microservices.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ikiiki-record
  labels:
    name: ikiiki-record

---
# API Gateway
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  name: ikiiki-gateway
  namespace: ikiiki-record
spec:
  selector:
    istio: ingressgateway
  servers:
  - port:
      number: 80
      name: http
    hosts:
    - ikiiki-record.example.com
  - port:
      number: 443
      name: https
    tls:
      mode: SIMPLE
      credentialName: ikiiki-tls
    hosts:
    - ikiiki-record.example.com

---
# Virtual Service
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: ikiiki-vs
  namespace: ikiiki-record
spec:
  hosts:
  - ikiiki-record.example.com
  gateways:
  - ikiiki-gateway
  http:
  - match:
    - uri:
        prefix: /api/v1/students
    route:
    - destination:
        host: student-service
        port:
          number: 3000
    timeout: 30s
    retries:
      attempts: 3
      perTryTimeout: 10s
  - match:
    - uri:
        prefix: /api/v1/analysis
    route:
    - destination:
        host: analysis-service
        port:
          number: 3001
    timeout: 60s
    retries:
      attempts: 2
      perTryTimeout: 30s
  - match:
    - uri:
        prefix: /api/v1/visualization
    route:
    - destination:
        host: visualization-service
        port:
          number: 3002
    timeout: 30s
    retries:
      attempts: 3
      perTryTimeout: 10s

---
# Service Mesh
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: ikiiki-record
spec:
  mtls:
    mode: STRICT

---
# Authorization Policy
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: ikiiki-authz
  namespace: ikiiki-record
spec:
  selector:
    matchLabels:
      app: student-service
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/istio-system/sa/istio-ingressgateway-service-account"]
  - to:
    - operation:
        methods: ["GET", "POST", "PUT", "DELETE"]
```

**サービスディスカバリ**:
```yaml
# deployment/kubernetes/service-discovery.yaml
apiVersion: v1
kind: Service
metadata:
  name: student-service
  namespace: ikiiki-record
  labels:
    app: student-service
    version: v1
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "3000"
    prometheus.io/path: "/metrics"
spec:
  selector:
    app: student-service
    version: v1
  ports:
  - name: http
    port: 80
    targetPort: 3000
    protocol: TCP
  - name: metrics
    port: 9090
    targetPort: 9090
    protocol: TCP
  type: ClusterIP

---
apiVersion: v1
kind: Service
metadata:
  name: analysis-service
  namespace: ikiiki-record
  labels:
    app: analysis-service
    version: v1
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "3001"
    prometheus.io/path: "/metrics"
spec:
  selector:
    app: analysis-service
    version: v1
  ports:
  - name: http
    port: 80
    targetPort: 3001
    protocol: TCP
  - name: metrics
    port: 9091
    targetPort: 9091
    protocol: TCP
  type: ClusterIP

---
apiVersion: v1
kind: Service
metadata:
  name: visualization-service
  namespace: ikiiki-record
  labels:
    app: visualization-service
    version: v1
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "3002"
    prometheus.io/path: "/metrics"
spec:
  selector:
    app: visualization-service
    version: v1
  ports:
  - name: http
    port: 80
    targetPort: 3002
    protocol: TCP
  - name: metrics
    port: 9092
    targetPort: 9092
    protocol: TCP
  type: ClusterIP
```

### DEPLOY_01_01_05-005: テストデプロイ
**対応目標**: GOAL_01_01_05-005
**対応タスク**: TASK_01_01_05-005
**対応アーキテクチャ**: ARCH_01_01_05-005
**対応構造**: STRUCT_01_01_05-005
**対応挙動**: BEHAV_01_01_05-005
**対応実装**: IMPL_01_01_05-005
**対応テスト**: TEST_01_01_05-005

**CI/CDパイプライン**:
```yaml
# .github/workflows/test-deploy.yml
name: Test and Deploy

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ikiiki-record

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npm run type-check
    
    - name: Run unit tests
      run: npm run test:unit
    
    - name: Run integration tests
      run: npm run test:integration
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella

  e2e-test:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build
    
    - name: Install Playwright
      run: npx playwright install --with-deps
    
    - name: Run E2E tests
      run: npm run test:e2e
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30

  security-scan:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Run security audit
      run: npm audit --audit-level moderate
    
    - name: Run Snyk security scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
    
    - name: Run CodeQL analysis
      uses: github/codeql-action/init@v2
      with:
        languages: javascript
    
    - name: Perform CodeQL analysis
      uses: github/codeql-action/analyze@v2

  build-and-deploy:
    runs-on: ubuntu-latest
    needs: [test, e2e-test, security-scan]
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
          type=raw,value=latest,enable={{is_default_branch}}
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
    
    - name: Deploy to staging
      if: github.ref == 'refs/heads/develop'
      run: |
        echo "Deploying to staging environment"
        # ステージング環境へのデプロイスクリプト
        ./scripts/deploy-to-staging.sh
    
    - name: Deploy to production
      if: github.ref == 'refs/heads/main'
      run: |
        echo "Deploying to production environment"
        # 本番環境へのデプロイスクリプト
        ./scripts/deploy-to-production.sh
```

**テスト環境設定**:
```yaml
# deployment/environments/staging.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ikiiki-staging
  labels:
    environment: staging

---
# ConfigMap for staging
apiVersion: v1
kind: ConfigMap
metadata:
  name: ikiiki-config
  namespace: ikiiki-staging
data:
  NODE_ENV: "staging"
  API_URL: "https://api-staging.ikiiki-record.example.com"
  LOG_LEVEL: "debug"
  ENABLE_METRICS: "true"
  ENABLE_TRACING: "true"

---
# Secret for staging
apiVersion: v1
kind: Secret
metadata:
  name: ikiiki-secrets
  namespace: ikiiki-staging
type: Opaque
data:
  DATABASE_URL: <base64-encoded-database-url>
  REDIS_URL: <base64-encoded-redis-url>
  JWT_SECRET: <base64-encoded-jwt-secret>
  SENTRY_DSN: <base64-encoded-sentry-dsn>
```

### DEPLOY_01_01_06-006: AI処理デプロイ
**対応目標**: GOAL_01_01_06-006
**対応タスク**: TASK_01_01_06-006
**対応アーキテクチャ**: ARCH_01_01_06-006
**対応構造**: STRUCT_01_01_06-006
**対応挙動**: BEHAV_01_01_06-006
**対応実装**: IMPL_01_01_06-006
**対応テスト**: TEST_01_01_06-006

**GPU対応デプロイ**:
```yaml
# deployment/kubernetes/ai-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-service
  namespace: ikiiki-record
  labels:
    app: ai-service
    component: emotion-analysis
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ai-service
      component: emotion-analysis
  template:
    metadata:
      labels:
        app: ai-service
        component: emotion-analysis
    spec:
      # GPUノードセレクター
      nodeSelector:
        accelerator: nvidia-tesla-t4
      tolerations:
      - key: nvidia.com/gpu
        operator: Exists
        effect: NoSchedule
      
      containers:
      - name: emotion-analysis
        image: ikiiki-record/ai-service:latest
        imagePullPolicy: Always
        ports:
        - name: http
          containerPort: 4000
          protocol: TCP
        env:
        - name: NODE_ENV
          value: "production"
        - name: MODEL_PATH
          value: "/models/emotion"
        - name: GPU_ENABLED
          value: "true"
        - name: CUDA_VISIBLE_DEVICES
          value: "0"
        resources:
          requests:
            memory: "4Gi"
            cpu: "2000m"
            nvidia.com/gpu: 1
          limits:
            memory: "8Gi"
            cpu: "4000m"
            nvidia.com/gpu: 1
        
        # モデルボリューム
        volumeMounts:
        - name: model-volume
          mountPath: /models
          readOnly: true
        - name: cache-volume
          mountPath: /cache
        
        # GPUヘルスチェック
        livenessProbe:
          exec:
            command:
            - python
            - -c
            - |
              import torch
              print("GPU Available:", torch.cuda.is_available())
              print("GPU Count:", torch.cuda.device_count())
              exit(0 if torch.cuda.is_available() else 1)
          initialDelaySeconds: 60
          periodSeconds: 30
          timeoutSeconds: 10
          failureThreshold: 3
        
        readinessProbe:
          httpGet:
            path: /health
            port: http
            scheme: HTTP
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
      
      volumes:
      - name: model-volume
        persistentVolumeClaim:
          claimName: ai-models-pvc
      - name: cache-volume
        emptyDir:
          sizeLimit: 2Gi

---
# PVC for AI models
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ai-models-pvc
  namespace: ikiiki-record
spec:
  accessModes:
  - ReadOnlyMany
  storageClassName: fast-ssd
  resources:
    requests:
      storage: 10Gi

---
# HPA for AI service
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ai-service-hpa
  namespace: ikiiki-record
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ai-service
  minReplicas: 1
  maxReplicas: 5
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  - type: External
    external:
      metric:
        name: gpu_utilization
      target:
        type: Utilization
        averageUtilization: 80
```

**モデルデプロイメント**:
```yaml
# deployment/kubernetes/model-deployment.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: model-deployment
  namespace: ikiiki-record
spec:
  template:
    spec:
      restartPolicy: OnFailure
      containers:
      - name: model-deployer
        image: ikiiki-record/model-deployer:latest
        command:
        - /bin/bash
        - -c
        - |
          # モデルのダウンロードと検証
          echo "Downloading emotion analysis model..."
          wget -O /models/emotion/model.json https://models.ikiiki-record.example.com/emotion/model.json
          wget -O /models/emotion/weights.bin https://models.ikiiki-record.example.com/emotion/weights.bin
          
          # モデルの検証
          echo "Validating model..."
          python -c "
          import tensorflow as tf
          model = tf.load_models('/models/emotion')
          print('Model loaded successfully')
          print('Model input shape:', model.input_shape)
          print('Model output shape:', model.output_shape)
          "
          
          # モデルのバージョン管理
          echo "Creating model version..."
          echo "{\"version\":\"$(date +%Y%m%d-%H%M%S)\",\"timestamp\":\"$(date -Iseconds)\",\"checksum\":\"$(sha256sum /models/emotion/model.json | cut -d' ' -f1)\"}" > /models/emotion/version.json
          
          echo "Model deployment completed successfully!"
        
        env:
        - name: MODEL_VERSION
          value: "latest"
        - name: MODEL_URL
          value: "https://models.ikiiki-record.example.com"
        
        volumeMounts:
        - name: model-volume
          mountPath: /models
        
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
      
      volumes:
      - name: model-volume
        persistentVolumeClaim:
          claimName: ai-models-pvc
      
      # ジョブのタイムアウト
      activeDeadlineSeconds: 1800
```

### DEPLOY_01_01_07-007: ユーザビリティデプロイ
**対応目標**: GOAL_01_01_07-007
**対応タスク**: TASK_01_01_07-007
**対応アーキテクチャ**: ARCH_01_01_07-007
**対応構造**: STRUCT_01_01_07-007
**対応挙動**: BEHAV_01_01_07-007
**対応実装**: IMPL_01_01_07-007
**対応テスト**: TEST_01_01_07-007

**国際化デプロイ**:
```yaml
# deployment/kubernetes/i18n-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: i18n-config
  namespace: ikiiki-record
data:
  # サポート言語設定
  supported-languages.json: |
    {
      "languages": [
        {
          "code": "ja",
          "name": "日本語",
          "flag": "🇯🇵",
          "rtl": false,
          "default": true
        },
        {
          "code": "en",
          "name": "English",
          "flag": "🇺🇸",
          "rtl": false,
          "default": false
        },
        {
          "code": "zh",
          "name": "中文",
          "flag": "🇨🇳",
          "rtl": false,
          "default": false
        },
        {
          "code": "ko",
          "name": "한국어",
          "flag": "🇰🇷",
          "rtl": false,
          "default": false
        }
      ]
    }
  
  # アクセシビリティ設定
  accessibility-config.json: |
    {
      "screenReader": {
        "enabled": true,
        "announcements": {
          "pageLoad": "ページが読み込まれました",
          "dataGenerated": "データが生成されました",
          "error": "エラーが発生しました"
        }
      },
      "keyboardNavigation": {
        "enabled": true,
        "skipLinks": true,
        "focusManagement": true
      },
      "visualAids": {
        "highContrast": true,
        "largeText": true,
        "reducedMotion": true
      },
      "colorBlindSupport": {
        "protanopia": true,
        "deuteranopia": true,
        "tritanopia": true
      }
    }
  
  # ユーザーガイド設定
  user-guide.json: |
    {
      "onboarding": {
        "enabled": true,
        "steps": [
          {
            "id": "welcome",
            "title": "ようこそ",
            "content": "イキイキレコードへようこそ！",
            "target": "#welcome-section"
          },
          {
            "id": "data-generation",
            "title": "データ生成",
            "content": "テストデータを生成する方法を学びましょう",
            "target": "#data-generator"
          },
          {
            "id": "visualization",
            "title": "データ可視化",
            "content": "生成されたデータをグラフで確認しましょう",
            "target": "#chart-container"
          }
        ]
      },
      "helpSystem": {
        "enabled": true,
        "searchable": true,
        "categories": [
          "getting-started",
          "data-generation",
          "visualization",
          "troubleshooting"
        ]
      }
    }

---
# 多言語コンテンツのデプロイ
apiVersion: batch/v1
kind: Job
metadata:
  name: i18n-deployment
  namespace: ikiiki-record
spec:
  template:
    spec:
      restartPolicy: OnFailure
      containers:
      - name: i18n-deployer
        image: ikiiki-record/i18n-deployer:latest
        command:
        - /bin/bash
        - -c
        - |
          # 翻訳ファイルのデプロイ
          echo "Deploying internationalization files..."
          
          # 各言語の翻訳をデプロイ
          for lang in ja en zh ko; do
            echo "Deploying $lang translations..."
            
            # 翻訳ファイルの検証
            python -c "
            import json
            with open('/translations/$lang/common.json', 'r') as f:
              data = json.load(f)
            print(f'$lang common keys: {len(data)}')
            "
            
            # CDNへのアップロード
            aws s3 sync /translations/$lang/ s3://ikiiki-i18n/$lang/ --delete
            echo "Uploaded $lang translations to CDN"
          done
          
          # 翻訳の整合性チェック
          echo "Checking translation consistency..."
          python /scripts/check-translation-consistency.py
          
          echo "Internationalization deployment completed!"
        
        env:
        - name: AWS_REGION
          value: "ap-northeast-1"
        - name: S3_BUCKET
          value: "ikiiki-i18n"
        
        volumeMounts:
        - name: translations-volume
          mountPath: /translations
        
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
      
      volumes:
      - name: translations-volume
        configMap:
          name: i18n-translations
```

### DEPLOY_01_01_08-008: 運用デプロイ
**対応目標**: GOAL_01_01_08-008
**対応タスク**: TASK_01_01_08-008
**対応アーキテクチャ**: ARCH_01_01_08-008
**対応構造**: STRUCT_01_01_08-008
**対応挙動**: BEHAV_01_01_08-008
**対応実装**: IMPL_01_01_08-008
**対応テスト**: TEST_01_01_08-008

**本番環境デプロイ**:
```yaml
# deployment/production/production-deployment.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: ikiiki-record-production
  namespace: argocd
spec:
  project: ikiiki-record
  source:
    repoURL: https://github.com/nobu007/yka_ikiiki_record
    targetRevision: main
    path: deployment/kubernetes/production
  destination:
    server: https://kubernetes.default.svc
    namespace: ikiiki-production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m

---
# 本番環境のネームスペース
apiVersion: v1
kind: Namespace
metadata:
  name: ikiiki-production
  labels:
    environment: production
    security-level: high
  annotations:
    iam.amazonaws.com/permitted: "true"
    policies.octopus.com/managed: "true"

---
# Network Policy
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: ikiiki-production-netpol
  namespace: ikiiki-production
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    - namespaceSelector:
        matchLabels:
          name: monitoring
    ports:
    - protocol: TCP
      port: 80
    - protocol: TCP
      port: 443
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: kube-system
    ports:
    - protocol: TCP
      port: 53
    - protocol: UDP
      port: 53
  - to: []
    ports:
    - protocol: TCP
      port: 443
    - protocol: TCP
      port: 80

---
# Pod Security Policy
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: ikiiki-production-psp
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  fsGroup:
    rule: 'RunAsAny'
```

**監視・ロギング**:
```yaml
# deployment/monitoring/monitoring-stack.yaml
# Prometheus
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s
      external_labels:
        cluster: 'production'
        region: 'ap-northeast-1'
    
    rule_files:
      - "/etc/prometheus/rules/*.yml"
    
    alerting:
      alertmanagers:
        - static_configs:
            - targets:
              - alertmanager:9093
    
    scrape_configs:
      - job_name: 'kubernetes-apiservers'
        kubernetes_sd_configs:
        - role: endpoints
        scheme: https
        tls_config:
          ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
        bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
        relabel_configs:
        - source_labels: [__meta_kubernetes_namespace, __meta_kubernetes_service_name, __meta_kubernetes_endpoint_port_name]
          action: keep
          regex: default;kubernetes;https
      
      - job_name: 'ikiiki-record'
        kubernetes_sd_configs:
        - role: endpoints
          namespaces:
            names:
            - ikiiki-production
        relabel_configs:
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_scrape]
          action: keep
          regex: true
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_path]
          action: replace
          target_label: __metrics_path__
          regex: (.+)
        - source_labels: [__address__, __meta_kubernetes_service_annotation_prometheus_io_port]
          action: replace
          regex: ([^:]+)(?::\d+)?;(\d+)
          replacement: $1:$2
          target_label: __address__
        - action: labelmap
          regex: __meta_kubernetes_service_label_(.+)
          replacement: $1
        - source_labels: [__meta_kubernetes_namespace]
          action: replace
          target_label: kubernetes_namespace
        - source_labels: [__meta_kubernetes_service_name]
          action: replace
          target_label: kubernetes_name

---
# Grafana
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-dashboards
  namespace: monitoring
data:
  ikiiki-dashboard.json: |
    {
      "dashboard": {
        "id": null,
        "title": "イキイキレコード - 本番環境",
        "tags": ["ikiiki-record", "production"],
        "timezone": "Asia/Tokyo",
        "panels": [
          {
            "title": "リクエスト数",
            "type": "graph",
            "targets": [
              {
                "expr": "sum(rate(http_requests_total{namespace=\"ikiiki-production\"}[5m]))",
                "legendFormat": "{{method}} {{status}}"
              }
            ]
          },
          {
            "title": "レスポンスタイム",
            "type": "graph",
            "targets": [
              {
                "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{namespace=\"ikiiki-production\"}[5m]))",
                "legendFormat": "95th percentile"
              }
            ]
          },
          {
            "title": "エラーレート",
            "type": "singlestat",
            "targets": [
              {
                "expr": "sum(rate(http_requests_total{namespace=\"ikiiki-production\",status=~\"5..\"}[5m])) / sum(rate(http_requests_total{namespace=\"ikiiki-production\"}[5m]))",
                "legendFormat": "Error Rate"
              }
            ]
          }
        ]
      }
    }

---
# AlertManager
apiVersion: v1
kind: ConfigMap
metadata:
  name: alertmanager-config
  namespace: monitoring
data:
  alertmanager.yml: |
    global:
      smtp_smarthost: 'smtp.example.com:587'
      smtp_from: 'alerts@ikiiki-record.example.com'
      smtp_auth_username: 'alerts@ikiiki-record.example.com'
      smtp_auth_password_file: '/etc/alertmanager/secrets/smtp-password'
    
    route:
      group_by: ['alertname', 'cluster', 'service']
      group_wait: 10s
      group_interval: 10s
      repeat_interval: 1h
      receiver: 'web.hook'
      routes:
      - match:
          severity: critical
        receiver: 'critical-alerts'
      - match:
          severity: warning
        receiver: 'warning-alerts'
    
    receivers:
    - name: 'web.hook'
      webhook_configs:
      - url: 'http://notification-service:8080/webhook'
        send_resolved: true
    
    - name: 'critical-alerts'
      email_configs:
      - to: 'oncall@ikiiki-record.example.com'
        subject: '[CRITICAL] イキイキレコード アラート'
        body: |
          {{ range .Alerts }}
          アラート: {{ .Annotations.summary }}
          詳細: {{ .Annotations.description }}
          時刻: {{ .StartsAt }}
          {{ end }}
          {{ end }}
    
    - name: 'warning-alerts'
      email_configs:
      - to: 'devops@ikiiki-record.example.com'
        subject: '[WARNING] イキイキレコード アラート'
        body: |
          {{ range .Alerts }}
          アラート: {{ .Annotations.summary }}
          詳細: {{ .Annotations.description }}
          時刻: {{ .StartsAt }}
          {{ end }}
          {{ end }}
```

## デプロイ戦略

### 1. 環境戦略
- **開発環境**: 開発者ごとの個別環境
- **ステージング環境**: 本番と同等の統合テスト環境
- **本番環境**: 高可用性・高セキュリティ構成

### 2. デプロイ方法
- **Blue-Greenデプロイ**: ゼロダウンタイムの最小化
- **カナリアリリース**: 段階的なリリースと監視
- **ローリングアップデート**: サービス継続性の確保

### 3. 監視体制
- **メトリクス監視**: Prometheus + Grafana
- **ログ集約**: ELK Stack
- **トレーシング**: Jaeger
- **アラート**: AlertManager

### 4. セキュリティ対策
- **ネットワーク分離**: Network Policy
- **アクセス制御**: RBAC + IAM
- **暗号化**: 通信・保存データの暗号化
- **脆弱性スキャン**: 定期的なセキュリティ診断

---

**更新履歴**:
- 2024-01-01: 初版作成
- 2024-01-15: AIデプロイ追加
- 2024-02-01: 本番環境構成拡充