export default class ApiServicePool {
    map: Map<string, any>;

    constructor() {
        this.map = new Map();
    }

    get(key: string) {
        return this.map.get(key);
    }

    set(key: string, value: any) {
        return this.map.set(key, value);
    }

    remove(key: string) {
        return this.map.delete(key)
    }
}