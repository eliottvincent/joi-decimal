# joi-decimal-extension

Joi extension for Decimal type.

Useful to validate any scientific / financial number.


[![Build Status](https://travis-ci.com/eliottvincent/joi-decimal-extension.svg?branch=master)](https://travis-ci.com/eliottvincent/joi-decimal-extension)
[![npm version](https://badge.fury.io/js/joi-decimal-extension.svg)](http://badge.fury.io/js/joi-decimal-extension)


## Usage

```js
const BaseJoi = require('@hapi/joi');
const { DecimalExtension } = require('joi-decimal-extension');
const Joi = BaseJoi.extend(DecimalExtension);

const schema = Joi.decimal().precision(2, 4).greater(100.0);
```

## API

- [`decimal` - inherits from `Any`](#decimal---inherits-from-any)
    - [`decimal.finite()`](#decimalfinite)
    - [`decimal.greater(limit)`](#decimalgreaterlimit)
    - [`decimal.integer()`](#decimalinteger)
    - [`decimal.less(limit)`](#decimallesslimit)
    - [`decimal.max(limit)`](#decimalmaxlimit)
    - [`decimal.min(limit)`](#decimalminlimit)
    - [`decimal.multiple(base)`](#decimalmultiplebase)
    - [`decimal.nan()`](#decimalnan)
    - [`decimal.negative()`](#decimalnegative)
    - [`decimal.positive()`](#decimalpositive)
    - [`decimal.precision(sd, rm)`](#decimalprecisionsd-rm)
    - [`decimal.zero()`](#decimalzero)
- [List of errors](#list-of-errors)
  - [`decimal.base`](#decimalbase)
  - [`decimal.finite`](#decimalfinite-1)
  - [`decimal.greater`](#decimalgreater)
  - [`decimal.integer`](#decimalinteger-1)
  - [`decimal.less`](#decimalless)
  - [`decimal.max`](#decimalmax)
  - [`decimal.min`](#decimalmin)
  - [`decimal.multiple`](#decimalmultiple)
  - [`decimal.nan`](#decimalnan-1)
  - [`decimal.negative`](#decimalnegative-1)
  - [`decimal.positive`](#decimalpositive-1)
  - [`decimal.precision`](#decimalprecision)
  - [`decimal.ref`](#decimalref)
  - [`decimal.zero`](#decimalzero-1)


### `decimal` - inherits from `Any`

Generates a schema object that matches a Decimal type (as well as a JavaScript string or number that can be converted to Decimal type). If
the validation `convert` option is on (enabled by default), a string or number will be converted to a `Decimal`, if specified.
Also, if
`convert` is on and `decimal.precision()` is used, the value will be converted to the specified `precision` as well.


```js
const dec = Joi.decimal();
dec.validate('0.046875', (err, value) => { });
```

Possible validation errors: [`decimal.base`](#decimalbase)


#### `decimal.finite()`

Requires the number to be finite.

```js
const schema = Joi.decimal().finite();
```

Possible validation errors: [`decimal.finite`](#decimalfinite-1)


#### `decimal.greater(limit)`

Specifies that the value must be greater than `limit` or a reference.

```js
const schema = Joi.decimal().greater(5.000);
```

```js
const schema = Joi.object({
  min: Joi.decimal().required(),
  max: Joi.decimal().greater(Joi.ref('min')).required()
});
```

Possible validation errors: [`decimal.greater`](#decimalgreater), [`decimal.ref`](#decimalref)


#### `decimal.integer()`

Requires the number to be an integer (no floating point).

```js
const schema = Joi.decimal().integer();
```

Possible validation errors: [`decimal.integer`](#decimalinteger)


#### `decimal.less(limit)`

Specifies that the value must be less than `limit` or a reference.

```js
const schema = Joi.decimal().less(10);
```

```js
const schema = Joi.object({
  min: Joi.decimal().less(Joi.ref('max')).required(),
  max: Joi.decimal().required()
});
```

Possible validation errors: [`decimal.less`](#decimalless), [`decimal.ref`](#decimalref)


#### `decimal.max(limit)`

Specifies the maximum value where:
- `limit` - the maximum value allowed or a reference.

```js
const schema = Joi.decimal().max(10);
```

```js
const schema = Joi.object({
  min: Joi.decimal().max(Joi.ref('max')).required(),
  max: Joi.decimal().required()
});
```

Possible validation errors: [`decimal.max`](#decimalmax), [`decimal.ref`](#decimalref)


#### `decimal.min(limit)`

Specifies the minimum value where:
- `limit` - the minimum value allowed or a reference.

```js
const schema = Joi.decimal().min(2);
```

```js
const schema = Joi.object({
  min: Joi.decimal().required(),
  max: Joi.decimal().min(Joi.ref('min')).required()
});
```

Possible validation errors: [`decimal.min`](#decimalmin), [`decimal.ref`](#decimalref)


#### `decimal.multiple(base)`

Specifies that the value must be a multiple of `base` (or a reference):

```js
const schema = Joi.decimal().multiple(3);
```

Possible validation errors: [`decimal.multiple`](#decimalmultiple), [`decimal.ref`](#decimalref)


#### `decimal.nan()`

Requires the number to be NaN.

```js
const schema = Joi.decimal().nan();
```

Possible validation errors: [`decimal.nan`](#decimalnan-1)


#### `decimal.negative()`

Requires the number to be negative.

```js
const schema = Joi.decimal().negative();
```

Possible validation errors: [`decimal.negative`](#decimalnegative-1)


#### `decimal.positive()`

Requires the number to be positive.

```js
const schema = Joi.decimal().positive();
```

Possible validation errors: [`decimal.positive`](#decimalpositive-1)


#### `decimal.precision(sd, rm)`

Specifies the maximum precision where:
- `sd` - the number of significant digits on which to round.
- `rm` - the rounding mode to use.

```js
const schema = Joi.decimal().precision(2, 5);
```

Possible validation errors: [`decimal.precision`](#decimalprecision)


#### `decimal.zero()`

Requires the number to be zero.

```js
const schema = Joi.decimal().zero();
```

Possible validation errors: [`decimal.zero`](#decimalzero-1)



### List of errors

#### `decimal.base`

The value is not a Decimal or could not be cast to a Decimal.


#### `decimal.finite`

The number was not finite.


#### `decimal.greater`

The number is lower or equal to the limit that you set.

Additional local context properties:
```ts
{
    limit: number // Minimum value that was expected for this number
}
```


#### `decimal.integer`

The number is not a valid integer.


#### `decimal.less`

The number is higher or equal to the limit that you set.

Additional local context properties:
```ts
{
    limit: number // Maximum value that was expected for this number
}
```


#### `decimal.max`

The number is higher than the limit that you set.

Additional local context properties:
```ts
{
    limit: number // Maximum value that was expected for this number
}
```

#### `decimal.min`

The number is lower than the limit that you set.

Additional local context properties:
```ts
{
    limit: number // Minimum value that was expected for this number
}
```


#### `decimal.multiple`

The number could not be divided by the base you provided.

Additional local context properties:
```ts
{
    base: number // The number of which the input is supposed to be a multiple of
}
```


#### `decimal.nan`

The number is not NaN.


#### `decimal.negative`

The number was positive.


#### `decimal.positive`

The number was negative.


#### `decimal.precision`

The arguments (`sd` and/or `rm`) are not numbers.


#### `decimal.ref`

A reference was used in one of [`decimal.greater()`](#decimalgreaterlimit), [`decimal.less()`](#decimallesslimit), [`decimal.max()`](#decimalmaxlimit), [`decimal.min()`](#decimalminlimit) or [`decimal.multiple()`](#decimalmultiplebase) and the value pointed to by that reference in the input is not a valid Decimal or could not be cast to a Decimal.


#### `decimal.zero`

The number is not zero.
