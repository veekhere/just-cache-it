# just-cache-it

A generic cache implementation with optional TTL support and subscriptions

- **Immutable** values
- **Lightweight** and "**zero-dependency**"
- **TTL** support
- **Cache update** subscriptions
- **Cache value update** subscriptions
- **Cache key** utilities
- **TypeScript** support

## Dependencies

**Runtime**

- [uuid](https://github.com/uuidjs/uuid) for UUID generation (zero-dependency)
- [lodash.clonedeep](https://github.com/lodash/lodash) for deep cloning (zero-dependency)

**Development**

- [jest](https://github.com/facebook/jest)
- [ts-jest](https://github.com/kulshekhar/ts-jest)
- [prettier](https://github.com/prettier/prettier)
- [typescript](https://github.com/microsoft/TypeScript)

## Quickstart

**1. Install**

```bash
npm install cache-it
```

**2. Create a cache**

```typescript
import { CacheIt } from 'cache-it';

const cache = new CacheIt<string>();

const cacheValue: CacheValue<string> = cache.set('key', 'value');

cacheValue.unwrapPrevious(); // ⇨ undefined
cacheValue.unwrapCurrent(); // ⇨ 'value'

cacheValue.subscribe({
  next: (value: CacheValue<string>) => {
    const previousValue = value.unwrapPrevious();
    const currentValue = value.unwrapCurrent();

    // Do something with the previous and current values
  },
  complete: () => {
    // Trigger something when the subscription is cancelled
  },
});
```

## API Summary

**Main cache**

|                                                         |                                                    |                 |
| ------------------------------------------------------- | -------------------------------------------------- | --------------- |
| [`CacheIt`](#cacheit)                                   | The main cache class                               | New in `v1.0.0` |
| [`CacheSubscriptionHandler`](#cachesubscriptionhandler) | Represents a handler to call when cache is updated | New in `v1.0.0` |
| [`CacheSubscription`](#cachesubscription)               | Represents a subscription to cache changes         | New in `v1.0.0` |

**Cache values**

|                                                                     |                                                                 |                 |
| ------------------------------------------------------------------- | --------------------------------------------------------------- | --------------- |
| [`CacheValue`](#cachevalue)                                         | Represents a cached value that can be updated and subscribed to | New in `v1.0.0` |
| [`UnwrapHandlers`](#unwraphandlers)                                 | Represents the handlers to call when unwrapping a cache value   | New in `v1.0.0` |
| [`CacheValueSubscriptionHandlers`](#cachevaluesubscriptionhandlers) | Represents the handlers to call when cache value changes        | New in `v1.0.0` |
| [`CacheValueSubscription`](#cachevaluesubscription)                 | Represents a subscription to a cache value                      | New in `v1.0.0` |

**Types and utilities**

|                                 |                                                   |                 |
| ------------------------------- | ------------------------------------------------- | --------------- |
| [`CacheItUtils`](#cacheitutils) | Utility functions for working with cache entries  | New in `v1.0.0` |
| [`Maybe`](#maybe)               | Represents a value that may or may not be present | New in `v1.0.0` |

## API

### CacheIt

Main cache class. Returned values are immutable

**1. Primitive values**

```typescript
import { CacheIt } from 'cache-it';

const cache = new CacheIt<string>(); // string cache

cache.set('key', 'value');

cache.get('key'); // ⇨ 'value'
```

**2. User defined values**

```typescript
import { CacheIt } from 'cache-it';

class User {
  constructor(public name: string) {}

  whois(): string {
    return `Hello, my name is ${this.name}`;
  }
}

const cache = new CacheIt<User>(); // User cache

cache.set('key', new User('John'));

cache.get('key')?.unwrapCurrent(); // ⇨ User { name: 'John' }
```

**3. Arrays**

```typescript
import { CacheIt } from 'cache-it';

const cache = new CacheIt<string[]>(); // string[] cache

cache.set('key', ['value']);

cache.get('key'); // ⇨ ['value']
```

**And so on...**

### CacheSubscriptionHandler

Represents a handler to call when cache is updated

```typescript
import { CacheIt } from 'cache-it';

const cache = new CacheIt<string>();

const handler: CacheSubscriptionHandler = () => {
  // Trigger something when the cache is updated
};

const subscription = cache.subscribe(handler);
```

### CacheSubscription

Represents a subscription to cache changes

```typescript
import { CacheIt } from 'cache-it';

const cache = new CacheIt<string>();

const subscription = cache.subscribe(() => {
  // Trigger something when the cache changes
});
```

### CacheValue

Represents a cached value that can be updated and subscribed to

```typescript
import { CacheIt, CacheValue } from 'cache-it';

const cache = new CacheIt<string>();

const cacheValue: CacheValue<string> = cache.set('key', 'value');

cacheValue.unwrapPrevious(); // ⇨ undefined
cacheValue.unwrapCurrent(); // ⇨ 'value'

cacheValue.subscribe({
  next: (value: CacheValue<string>) => {
    // Do something with the previous and current values
  },
  complete: () => {
    // Trigger something when the subscription is cancelled
  },
});
```

### UnwrapHandlers

Represents the handlers to call when unwrapping a cache value

```typescript
import { CacheIt, CacheValue } from 'cache-it';

const cache = new CacheIt<string>();

const cacheValue: CacheValue<string> = cache.set('key', 'value');

const handlers: UnwrapHandlers<string> = {
  onPresent: (value: string) => {
    // Do something with the value
  },
  onAbsent: () => {
    // Do something when the value is absent
  },
};

cacheValue.unwrapPrevious(handlers);
cacheValue.unwrapCurrent(handlers);
```

### CacheValueSubscriptionHandlers

Represents the handlers to call when cache value changes

```typescript
import { CacheValue, CacheValueSubscriptionHandlers } from 'cache-it';

const handlers: CacheValueSubscriptionHandlers<string> = {
  next: (value: CacheValue<string>) => {
    // Do something with the previous and current values
  },
  complete: () => {
    // Trigger something when the subscription is cancelled
  },
};

// register cache ...

cache.subscribe(handlers);
```

### CacheValueSubscription

Represents a subscription to a cache value

```typescript
import { CacheIt, CacheValue } from 'cache-it';

const cache = new CacheIt<string>();

const cacheValue: CacheValue<string> = cache.set('key', 'value');

const subscription = cacheValue.subscribe({
  // handlers
});

// some complex logic

subscription.unsubscribe();
```

### CacheItUtils

Utility functions for working with cache entries

```typescript
import { CacheItUtils } from 'cache-it';

const keyGenerator = CacheItUtils.addBaseKey('BASE#KEY');

keyGenerator.generateKey('my', 'additional', 'parts'); // ⇨ '$CACHE-IT_BASE#KEY_my-additional-parts_2a4f54b2-700a-41b3-8008-ac641a550ee5'
```

### Maybe

Represents a value that may or may not be present

```typescript
import { Maybe } from 'cache-it';

const maybe: Maybe<string> = getData(); // ⇨ string | undefined
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

[MIT](https://github.com/veekhere/just-cache-it/blob/main/LICENSE)
