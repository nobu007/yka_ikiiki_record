import { Record } from '@/domain/entities/Record';

describe('Record Entity', () => {
  describe('creation', () => {
    it('should create a valid record without optional fields', () => {
      const record: Record = {
        emotion: 4.5,
        date: new Date('2026-03-16T10:00:00Z'),
        student: '学生1',
      };

      expect(record.emotion).toBe(4.5);
      expect(record.student).toBe('学生1');
      expect(record.date).toEqual(new Date('2026-03-16T10:00:00Z'));
      expect(record.comment).toBeUndefined();
      expect(record.id).toBeUndefined();
    });

    it('should create a valid record with all fields', () => {
      const record: Record = {
        id: 1,
        emotion: 3.5,
        date: new Date('2026-03-16T10:00:00Z'),
        student: '学生2',
        comment: 'テストコメント',
        createdAt: new Date('2026-03-16T09:00:00Z'),
        updatedAt: new Date('2026-03-16T10:00:00Z'),
      };

      expect(record.id).toBe(1);
      expect(record.emotion).toBe(3.5);
      expect(record.student).toBe('学生2');
      expect(record.comment).toBe('テストコメント');
      expect(record.createdAt).toEqual(new Date('2026-03-16T09:00:00Z'));
      expect(record.updatedAt).toEqual(new Date('2026-03-16T10:00:00Z'));
    });

    it('should allow comment to be optional', () => {
      const recordWithComment: Record = {
        emotion: 4.5,
        date: new Date('2026-03-16T10:00:00Z'),
        student: '学生1',
        comment: 'コメントあり',
      };

      const recordWithoutComment: Record = {
        emotion: 3.5,
        date: new Date('2026-03-16T10:00:00Z'),
        student: '学生2',
      };

      expect(recordWithComment.comment).toBe('コメントあり');
      expect(recordWithoutComment.comment).toBeUndefined();
    });
  });

  describe('emotion values', () => {
    it('should accept emotion values from 1 to 5', () => {
      const emotions = [1.0, 2.5, 3.0, 4.2, 5.0];

      emotions.forEach((emotion) => {
        const record: Record = {
          emotion,
          date: new Date('2026-03-16T10:00:00Z'),
          student: '学生1',
        };

        expect(record.emotion).toBe(emotion);
      });
    });

    it('should accept decimal emotion values', () => {
      const record: Record = {
        emotion: 3.7,
        date: new Date('2026-03-16T10:00:00Z'),
        student: '学生1',
      };

      expect(record.emotion).toBe(3.7);
    });
  });

  describe('student field', () => {
    it('should accept various student identifiers', () => {
      const students = ['学生1', '学生2', '学生999', 'Student A', '生徒1'];

      students.forEach((student) => {
        const record: Record = {
          emotion: 4.0,
          date: new Date('2026-03-16T10:00:00Z'),
          student,
        };

        expect(record.student).toBe(student);
      });
    });
  });

  describe('date field', () => {
    it('should accept Date objects', () => {
      const now = new Date();
      const past = new Date('2026-01-01T00:00:00Z');
      const future = new Date('2026-12-31T23:59:59Z');

      const recordNow: Record = {
        emotion: 4.0,
        date: now,
        student: '学生1',
      };

      const recordPast: Record = {
        emotion: 4.0,
        date: past,
        student: '学生2',
      };

      const recordFuture: Record = {
        emotion: 4.0,
        date: future,
        student: '学生3',
      };

      expect(recordNow.date).toEqual(now);
      expect(recordPast.date).toEqual(past);
      expect(recordFuture.date).toEqual(future);
    });
  });
});
