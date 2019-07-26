'use strict';

/* eslint-disable no-unused-vars */

const Decimal = require('decimal.js');


module.exports = joi => ({

  name: 'decimal',

  language: {
    base: '!!"{{value}}" is not a Decimal or could not be cast to a Decimal',
    finite: '!!"{{value}}" is not a finite number',
    greater: '!!"{{value}}" is lower or equal to the limit "{{limit}}"',
    integer: '!!"{{value}}" is not a valid integer',
    less: '!!"{{value}}" is higher or equal to the limit "{{limit}}"',
    max: '!!"{{value}}" is higher than the limit "{{limit}}"',
    min: '!!"{{value}}" is lower than the limit "{{limit}}"',
    negative: '!!"{{value}}" is positive',
    nan: '!!"{{value}}" is not NaN',
    positive: '!!"{{value}}" is negative',
    ref: '!!reference "{{value}}" is not a Decimal or could not be cast to a Decimal',
    zero: '!!"{{value}}" is not zero',
  },

  pre(value, state, prefs) {
    // Strict type checking to avoid returning true for [null, '', 0, NaN, false] values.
    if (!value && typeof value === 'undefined') {
      return value;
    }

    let decValue;
    try {
      decValue = new Decimal(value);
    } catch (error) {
      return this.createError('decimal.base', { value }, state, prefs);
    }

    if (prefs.convert) {
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
      name: 'finite',
      description(params) {
        return 'Value should be a finit number';
      },
      validate(params, value, state, prefs) {
        if (!value.isFinite()) {
          return this.createError('decimal.finite', { value }, state, prefs);
        }

        return value;
      },
    },
    {
      name: 'greater',
      description(params) {
        return `Value should be greater than ${params.limit}`;
      },
      params: {
        limit: joi.alternatives([
          joi.object().type(Decimal),
          joi.number().allow(Infinity, -Infinity, NaN, -NaN).strict(),
          joi.string(),
          joi.func().ref(),
        ]).required(),
      },
      validate(params, value, state, prefs) {
        let { limit } = params;
        if (joi.isRef(limit)) {
          // resolve
          limit = limit(state.reference || state.parent, prefs);
          // validate
          const noRefSchema = joi.alternatives([
            joi.object().type(Decimal),
            joi.number().allow(Infinity, -Infinity, NaN, -NaN).strict(),
            joi.string(),
          ]).required();
          const result = noRefSchema.validate(limit);
          if (result.error) {
            return this.createError('decimal.ref', { value, limit }, state, prefs);
          }
        }
        limit = new Decimal(limit);

        if (!new Decimal(value).gt(limit)) {
          return this.createError('decimal.greater', { value, limit }, state, prefs);
        }

        return value;
      },
    },
    {
      name: 'integer',
      description(params) {
        return 'Value should be an integer';
      },
      validate(params, value, state, prefs) {
        if (!value.isInt()) {
          return this.createError('decimal.integer', { value }, state, prefs);
        }

        return value;
      },
    },
    {
      name: 'less',
      description(params) {
        return `Value should be less than ${params.limit}`;
      },
      params: {
        limit: joi.alternatives([
          joi.object().type(Decimal),
          joi.number().allow(Infinity, -Infinity, NaN, -NaN).strict(),
          joi.string(),
          joi.func().ref(),
        ]).required(),
      },
      validate(params, value, state, prefs) {
        let { limit } = params;
        if (joi.isRef(limit)) {
          // resolve
          limit = limit(state.reference || state.parent, prefs);
          // validate
          const noRefSchema = joi.alternatives([
            joi.object().type(Decimal),
            joi.number().allow(Infinity, -Infinity, NaN, -NaN).strict(),
            joi.string(),
          ]).required();
          const result = noRefSchema.validate(limit);
          if (result.error) {
            return this.createError('decimal.ref', { value, limit }, state, prefs);
          }
        }
        limit = new Decimal(limit);

        if (!new Decimal(value).lt(limit)) {
          return this.createError('decimal.less', { value, limit }, state, prefs);
        }

        return value;
      },
    },
    {
      name: 'max',
      description(params) {
        return `Value should be less than or equal to ${params.limit}`;
      },
      params: {
        limit: joi.alternatives([
          joi.object().type(Decimal),
          joi.number().allow(Infinity, -Infinity, NaN, -NaN).strict(),
          joi.string(),
          joi.func().ref(),
        ]).required(),
      },
      validate(params, value, state, prefs) {
        let { limit } = params;
        if (joi.isRef(limit)) {
          // resolve
          limit = limit(state.reference || state.parent, prefs);
          // validate
          const noRefSchema = joi.alternatives([
            joi.object().type(Decimal),
            joi.number().allow(Infinity, -Infinity, NaN, -NaN).strict(),
            joi.string(),
          ]).required();
          const result = noRefSchema.validate(limit);
          if (result.error) {
            return this.createError('decimal.ref', { value, limit }, state, prefs);
          }
        }
        limit = new Decimal(limit);

        if (!new Decimal(value).lte(limit)) {
          return this.createError('decimal.max', { value, limit }, state, prefs);
        }

        return value;
      },
    },
    {
      name: 'min',
      description(params) {
        return `Value should be greater than or equal to ${params.limit}`;
      },
      params: {
        limit: joi.alternatives([
          joi.object().type(Decimal),
          joi.number().allow(Infinity, -Infinity, NaN, -NaN).strict(),
          joi.string(),
          joi.func().ref(),
        ]).required(),
      },
      validate(params, value, state, prefs) {
        let { limit } = params;
        if (joi.isRef(limit)) {
          // resolve
          limit = limit(state.reference || state.parent, prefs);
          // validate
          const noRefSchema = joi.alternatives([
            joi.object().type(Decimal),
            joi.number().allow(Infinity, -Infinity, NaN, -NaN).strict(),
            joi.string(),
          ]).required();
          const result = noRefSchema.validate(limit);
          if (result.error) {
            return this.createError('decimal.ref', { value, limit }, state, prefs);
          }
        }
        limit = new Decimal(limit);

        if (!new Decimal(value).gte(limit)) {
          return this.createError('decimal.min', { value, limit }, state, prefs);
        }

        return value;
      },
    },
    {
      name: 'negative',
      description(params) {
        return 'Value should be negative';
      },
      validate(params, value, state, prefs) {
        if (!value.isNeg()) {
          return this.createError('decimal.negative', { value }, state, prefs);
        }

        return value;
      },
    },
    {
      name: 'nan',
      description(params) {
        return 'Value should be NaN';
      },
      validate(params, value, state, prefs) {
        if (!value.isNaN()) {
          return this.createError('decimal.nan', { value }, state, prefs);
        }

        return value;
      },
    },
    {
      name: 'positive',
      description(params) {
        return 'Value should be positive';
      },
      validate(params, value, state, prefs) {
        if (!value.isPos()) {
          return this.createError('decimal.positive', { value }, state, prefs);
        }

        return value;
      },
    },
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
      validate(params, value, state, prefs) { // eslint-disable-line no-unused-vars
        // No-op just to enable description
        return value;
      },
    },
    {
      name: 'zero',
      description(params) {
        return 'Value should be zero';
      },
      validate(params, value, state, prefs) {
        if (!value.isZero()) {
          return this.createError('decimal.zero', { value }, state, prefs);
        }

        return value;
      },
    },
  ],
});
