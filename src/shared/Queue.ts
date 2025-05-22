type TaskValue = Promise<unknown> | unknown;
type Task<T extends TaskValue> = () => T;

export default class Queue {
    #tasks: Task<TaskValue>[] = [];
    #running = false;

    add<T extends TaskValue>(task: Task<T>): Promise<Awaited<T>> {
        return new Promise((resolve, reject) => {
            this.#tasks.push(async () => {
                try {
                    const result = await task();
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });
            this.next();
        });
    }

    async next() {
        if (this.#running) return; // We're already running

        this.#running = true;
        const task = this.#tasks.shift();
        if (!task) {
            this.#running = false;
            return;
        };

        await task();
        this.#running = false;
        this.next();
    }

    clear() {
        this.#tasks = [];
    }
}
