import cloneDeep from 'lodash.clonedeep';
import { v4 as uuidv4 } from 'uuid';


/**
 * Just Cache-It is a generic cache implementation with optional TTL support and subscriptions. It can be used to cache any value, including objects, arrays, and primitives.
 * @template T The type of values stored in the cache
 * @see https://github.com/veekhere/just-cache-it
 * @author veekhere
 * @license MIT
 * @version 1.0.0
 */




/**
 * Represents a value that may or may not be present
 * @template T The type of the value
 */
type Maybe<T> = T | undefined;

/**
 * Represents the current and previous values of a cache value
 * @template T The type of the value
 */
type CacheValueDescriptor<T> = {
  current: Maybe<T>;
  previous: Maybe<T>;
};

/**
 * Represents the handlers to call when unwrapping a cache value
 * @template T The type of the value
 */
type UnwrapHandlers<T> = {
  /**
   * Called when the value is present
   * @param value The value
   */
  onPresent?: (value: T) => void;

  /**
   * Called when the value is absent
   */
  onAbsent?: () => void;
};

/**
 * Subscription to a cache value
 */
type CacheValueSubscription = {
  /**
   * Unsubscribes from the cache value
   */
  unsubscribe: () => void;
};

/**
 * Represents the handlers to call when cache value changes
 */
type CacheValueSubscriptionHandlers<T> = {
  /**
   * Called when the value changes
   * @param value The new value of the cache
   */
  next?: (value: Omit<CacheValue<T>, "subscribe" | "unsubscribeAll">) => void;

  /**
   * Called when the subscription is cancelled
   */
  complete?: () => void;
};



/**
 * Represents a value that can be cached and subscribed to
 * @template T The type of the value
 */
class CacheValue<T> {

  private readonly value: CacheValueDescriptor<T> = {
    current: undefined,
    previous: undefined,
  };

  private readonly subscribers: Map<Symbol, CacheValueSubscriptionHandlers<T>> = new Map();

  /**
   * Creates a new cache value
   * @param ttl The time-to-live in milliseconds
   */
  constructor(ttl?: number) {
    if (ttl != null) {
      setTimeout(() => {
        this.update(undefined);
      }, ttl);
    }
  }

  /**
   * Updates the value in the cache
   * @param value The new value to set
   */
  update(value: Maybe<T>): void {
    const oldValue = typeof this.value.current === 'object' && this.value.current != null
      ? cloneDeep(this.value.current)
      : this.value.current;

    const newValue = typeof value === 'object' && value != null
      ? cloneDeep(value)
      : value;

    this.value.previous = oldValue;
    this.value.current = newValue;

    this.notifySubscribers();
  }

  /**
   * Returns the current value, or undefined if not present
   */
  unwrapCurrent(): Maybe<T>;

  /**
   * Calls the provided handlers with the current value, or undefined if not present
   * @param handlers The handlers to call
   */
  unwrapCurrent(handlers: UnwrapHandlers<T>): void;

  unwrapCurrent(handlers?: UnwrapHandlers<T>): Maybe<T> | void {
    if (handlers) {
      if (this.value.current) {
        handlers.onPresent?.(this.value.current);
      } else {
        handlers.onAbsent?.();
      }
    } else {
      return this.value.current;
    }
  }

  /**
   * Returns the previous value, or undefined if not present
   */
  unwrapPrevious(): Maybe<T>;

  /**
   * Calls the provided handlers with the previous value, or undefined if not present
   * @param handlers The handlers to call
   */
  unwrapPrevious(handlers: UnwrapHandlers<T>): void;

  unwrapPrevious(handlers?: UnwrapHandlers<T>): Maybe<T> | void {
    if (handlers) {
      if (this.value.previous) {
        handlers.onPresent?.(this.value.previous);
      } else {
        handlers.onAbsent?.();
      }
    } else {
      return this.value.previous;
    }
  }

  /**
   * Removes the current and previous values
   */
  clear(): void {
    this.value.current = undefined;
    this.value.previous = undefined;

    this.notifySubscribers();
  }

  /**
   * Subscribes to changes in the cache value
   * @param handlers The handlers to call when the value changes
   * @returns A subscription object that can be used to unsubscribe
   */
  subscribe(handlers: CacheValueSubscriptionHandlers<T>): CacheValueSubscription {
    const symbol = Symbol();
    this.subscribers.set(symbol, handlers);

    return {
      unsubscribe: () => {
        handlers?.complete?.();
        this.subscribers.delete(symbol);
      },
    };
  }

  /**
   * Unsubscribes from all subscribers
   */
  unsubscribeAll(): void {
    this.notifySubscribers(true);
    this.subscribers.clear();
  }

  private notifySubscribers(isComplete?: boolean): void {
    this.subscribers.forEach((handlers) => {
      if (isComplete) {
        handlers.complete?.();
      } else {
        handlers.next?.(this);
      }
    });
  }
}




/**
 * Subscription to a cache changes
 */
type CacheSubscription = {
  /**
   * Unsubscribes from the cache changes
   */
  unsubscribe: () => void;
};

/**
 * Represents a handler to call when cache is updated
 */
type CacheSubscriptionHandler = () => void;

/**
 * A generic cache implementation with optional TTL support
 * @template T The type of values stored in the cache
 */
class CacheIt<T> {

  private readonly cache: Map<string, CacheValue<T>> = new Map();

  private readonly subscribers: Map<Symbol, CacheSubscriptionHandler> = new Map();

  /**
   * Sets a value in the cache
   * @param key The key to store the value under
   * @param value The value to store
   * @param ttl Optional time-to-live in milliseconds
   */
  set(key: string, value: T, ttl?: number): CacheValue<T> {
    const cacheValue = new CacheValue<T>(ttl);
    cacheValue.update(value);

    this.cache.set(key, cacheValue);

    this.notifySubscribers();

    return cacheValue;
  }

  /**
   * Retrieves a value from the cache
   * @param key The key to lookup
   * @returns The stored value, or undefined if not found or expired
   */
  get(key: string): CacheValue<T> | undefined {
    const cacheValue = this.cache.get(key);

    if (!cacheValue) {
      return undefined;
    }

    return cacheValue;
  }

  /**
   * Removes a value from the cache
   * @param key The key to remove
   * @returns true if the key was found and removed, false otherwise
   */
  delete(key: string): boolean {
    const isDeleted = this.cache.delete(key);

    if (isDeleted) {
      this.notifySubscribers();
    }

    return isDeleted;
  }

  /**
   * Removes all entries from the cache
   */
  clear(): void {
    this.cache.clear();
    this.notifySubscribers();
  }

  /**
   * Returns the number of entries in the cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Checks if a key exists in the cache and is not expired
   * @param key The key to check
   * @returns true if the key exists and is not expired
   */
  has(key: string): boolean {
    const cacheValue = this.cache.get(key);

    if (!cacheValue) {
      return false;
    }

    return true;
  }

  /**
   * Subscribes to changes in the cache
   * @param handler The handler to call when the cache changes
   * @returns A subscription object that can be used to unsubscribe
   */
  subscribe(handler: CacheSubscriptionHandler): CacheSubscription {
    const symbol = Symbol();
    this.subscribers.set(symbol, handler);

    return {
      unsubscribe: () => {
        this.subscribers.delete(symbol);
      },
    };
  }

  /**
   * Unsubscribes from all subscribers without emitting any events
   */
  unsubscribeAll(): void {
    this.subscribers.clear();
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((handler) => handler());
  }
}




/**
 * Represents a key generator for cache entries
 */
type CacheKeyGenerator = {
  /**
   * Generates a key with additional parts
   * @param additional Additional parts to add to the key
   */
  generateKey: (...additional: string[]) => string;
};

/**
 * Utility functions for working with cache entries
 */
class CacheItUtils {

  /**
   * Adds a base key to a key generator
   * @param baseKey The base key to add
   * @returns A key generator with the base key added
   */
  static addBaseKey(baseKey: string): CacheKeyGenerator {
    if (!baseKey) {
      throw new Error('Base key cannot be empty');
    }

    return {
      generateKey: (...additional: string[]) => CacheItUtils.generateKeyWithBase(baseKey, ...additional),
    };
  }

  /**
   * Generates a key with additional parts
   * @param additional Additional parts to add to the key
   */
  static generateKey(...additional: string[]): string {
    return CacheItUtils.generateKeyWithBase(undefined, ...additional);
  }

  private static generateKeyWithBase(baseKey?: string, ...additional: string[]): string {
    const baseKeyPart = baseKey != null ? `${baseKey}_` : '';
    const additionalPart = additional != null && additional?.length > 0
      ? `${additional?.join('-')}_`
      : '';

    return `$CACHE-IT_${baseKeyPart}${additionalPart}${uuidv4()}`;
  }
}




export { CacheIt, CacheItUtils, CacheValue, CacheValueSubscription, UnwrapHandlers };

