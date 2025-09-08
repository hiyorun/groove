import type { Component } from 'vue';

export type ModalInstance<T = void> = {
  id: string;
  component: Component;
  props: Record<string, unknown>;
  resolve: (val: T | PromiseLike<T>) => void;
  reject: (reason: string) => void;
};

export class Modal<P = Record<string, unknown>, T = void> {
  public readonly id: string;
  public readonly component: Component;
  public readonly props: P;
  private _resolve!: (value: T) => void;
  private _reject!: (reason: string) => void;

  constructor(component: Component, props: P) {
    this.id = crypto.randomUUID();
    this.component = component;
    this.props = props;
  }

  public get promise(): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  public resolve(value: T): void {
    this._resolve(value);
  }

  public reject(reason: string): void {
    this._reject(reason);
  }
}
