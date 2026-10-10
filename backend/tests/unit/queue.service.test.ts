import { AsyncQueue } from '../../src/core/queue/queue.service.js';

describe('AsyncQueue Unit Tests', () => {
  it('should process jobs through registered handlers', async () => {
    const queue = new AsyncQueue<{ message: string }>('TestQueueUnit', 2);
    const processedMessages: string[] = [];

    queue.registerHandler('PROCESS_MSG', async (data) => {
      processedMessages.push(data.message);
    });

    queue.add('PROCESS_MSG', { message: 'Message 1' });
    queue.add('PROCESS_MSG', { message: 'Message 2' });

    // Wait briefly for queue processing
    await new Promise((resolve) => setTimeout(resolve, 300));
    await queue.shutdown(500);

    expect(processedMessages).toHaveLength(2);
    expect(processedMessages).toContain('Message 1');
    expect(processedMessages).toContain('Message 2');
  });

  it('should retry failed jobs up to maxRetries', async () => {
    const queue = new AsyncQueue<{ count: number }>('RetryQueue', 1);
    let attempts = 0;

    queue.registerHandler('FAIL_TASK', async () => {
      attempts++;
      if (attempts < 2) {
        throw new Error('Transient failure');
      }
    });

    queue.add('FAIL_TASK', { count: 1 }, { maxRetries: 3, retryDelayMs: 50 });

    await new Promise((resolve) => setTimeout(resolve, 400));
    await queue.shutdown(500);

    expect(attempts).toBe(2);
  });
});
