'use strict';

/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

const { expect } = require('chai');

const BaseJoi = require('@hapi/joi');
const Decimal = require('decimal.js');
const DecimalExtension = require('..');

const Joi = BaseJoi.extend(DecimalExtension);

const shouldSucceed = (value) => {
  it('should validate if value is finite', () => {
    const decValidator = Joi.decimal().finite();

    const result = decValidator.validate(value);

    expect(result.error).to.be.null;
  });
};

const shouldFail = (value) => {
  it('should return a validation error if value is not finite', () => {
    const decValidator = Joi.decimal().finite();

    const result = decValidator.validate(value);

    expect(result.error).to.not.be.null;
    expect(result.error.name).to.be.equal('ValidationError');
    expect(result.error.message).to.match(/is not a finite number/);
  });
};


describe('decimal - finite', () => {
  before(() => {
    Decimal.set({ defaults: true });

    Decimal.config({
      precision: 20,
      rounding: 4,
      toExpNeg: -7,
      toExpPos: 21,
      minE: -9e15,
      maxE: 9e15,
    });
  });

  // tests from decimal.js documentation
  shouldSucceed(1);
  shouldFail(Infinity);


  // tests from decimal.js
  shouldSucceed(1);
  shouldSucceed('-0.1');
  shouldFail(Infinity);
  shouldFail('-Infinity');
  shouldSucceed('0.0000000');
  shouldSucceed(-0);
  shouldFail('NaN');
  shouldSucceed('-1.234e+2');
  shouldSucceed('5e-200');
});
