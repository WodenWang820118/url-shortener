declare module 'zookeeper' {
  export default class ZooKeeper {
    constructor(options: any);
    init(options: any): void;
    on(event: string, callback: (...args: any[]) => void): void;
    close(): void;
    create(path: string, data: Buffer, flags: number): Promise<string>;
    static constants: any;
    static ZOO_LOG_LEVEL_WARN: number;
    static ZOO_EPHEMERAL: number;
  }
}
