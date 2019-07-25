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
    - [`decimal.precision(sd, rm)`](#decimalprecisionsdrm)
    - [`decimal.greater(limit)`](#decimalgreaterlimit)
    - [`decimal.less(limit)`](#decimallesslimit)
- [List of errors](#list-of-errors)
  - [`decimal.base`](#decimalbase)
  - [`decimal.precision`](#decimalprecision)


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


#### `decimal.precision(sd, rm)`

Specifies the maximum precision where:
- `sd` - the number of significant digits on which to round.
- `rm` - the rounding mode to use.

```js
const schema = Joi.decimal().precision(2, 5);
```

Possible validation errors: [`decimal.precision`](#decimalprecision)

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

### List of errors

#### `decimal.base`

The value is not a Decimal or could not be cast to a Decimal.

#### `decimal.greater`

The decimal is lower or equal to the limit that you set.

Additional local context properties:
```js
{
    limit: number // Minimum value that was expected for this decimal
}
```

#### `decimal.less`

The decimal is higher or equal to the limit that you set.

Additional local context properties:
```js
{
    limit: number // Maximum value that was expected for this decimal
}
```

#### `decimal.precision`

The arguments (`sd` and/or `rm`) are not numbers.

#### `decimal.ref`

A reference was used in one of [`decimal.less()`](#decimallesslimit) or [`decimal.greater()`](#decimalgreaterlimit) and the value pointed to by that reference in the input is not a valid Decimal or could not be cast to a Decimal.
