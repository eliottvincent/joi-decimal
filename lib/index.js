'use strict';

const Decimal = require('decimal.js');


module.exports = joi => ({

  name: 'decimal',

  language: {
    convert: '!!"{{value}}" is an invalid argument',
    greater: '!!"{{value}}" needs to be greater than "{{min}}"',
    less: '!!"{{value}}" needs to be less than "{{max}}"',
  },

  pre(value, state, options) {
    // Strict type checking to avoid returning true for [null, '', 0, NaN, false] values.
    if (!value && typeof value === 'undefined') {
      return value;
    }

    let decValue;
    try {
      decValue = new Decimal(value);
    } catch (error) {
      return this.createError('decimal.convert', { value }, state, options);
    }


    if (options.convert) {
      if (this._flags.sd) {
        decValue = decValue.toPrecision(
          this._flags.sd,
          (!this._flags.rm && typeof this._flags.rm === 'undefined')
            ? Decimal.rounding
            : this._flags.rm,
        );
      }
      return decValue;
    }

    return value;
  },


  rules: [
    {
      name: 'precision',
      description(params) { // eslint-disable-line no-unused-vars
        return 'Value precision';
      },
      params: {
        sd: joi.number().integer().positive().strict(),
        rm: joi.number().allow(
          Decimal.ROUND_UP,
          Decimal.ROUND_DOWN,
          Decimal.ROUND_CEIL,
          Decimal.ROUND_FLOOR,
          Decimal.ROUND_HALF_UP,
          Decimal.ROUND_HALF_DOWN,
          Decimal.ROUND_HALF_EVEN,
          Decimal.ROUND_HALF_CEIL,
          Decimal.ROUND_HALF_FLOOR,
        ).strict(),
      },
      setup(params) {
        this._flags.sd = params.sd;
        this._flags.rm = params.rm;
      },
      validate(params, value, state, options) { // eslint-disable-line no-unused-vars
        // No-op just to enable description
        return value;
      },
    },
    {
      name: 'greater',
      description(params) {
        return `Value should be greater than ${params.min}`;
      },
      params: {
        value: joi.alternatives([
          joi.object().type(Decimal),
          joi.number().allow(Infinity, -Infinity, NaN, -NaN).strict(),
          joi.string(),
        ]).required(),
      },
      validate(params, value, state, options) {
        const min = new Decimal(params.value);

        if (!new Decimal(value).gt(min)) {
          return this.createError('decimal.greater', { value, min }, state, options);
        }

        return value;
      },
    },
    {
      name: 'less',
      description(params) {
        return `Value should be less than ${params.max}`;
      },
      params: {
        value: joi.alternatives([
          joi.object().type(Decimal),
          joi.number().allow(Infinity, -Infinity, NaN, -NaN).strict(),
          joi.string(),
        ]).required(),
      },
      validate(params, value, state, options) {
        const max = new Decimal(params.value);

        if (!new Decimal(value).lt(max)) {
          return this.createError('decimal.less', { value, max }, state, options);
        }

        return value;
      },
    },
  ],
});
