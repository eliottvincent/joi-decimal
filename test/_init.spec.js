const { expect } = require('chai');

const BaseJoi = require('@hapi/joi');
const Decimal = require('decimal.js');
const DecimalExtension = require('..');

describe('decimal - init', () => {
  const Joi = BaseJoi.extend(DecimalExtension);

  it('should extend joi', () => {
    Joi.decimal();
  });

  it('should return validation error when invalid decimal value', () => {
    const decValidator = Joi.decimal();

    const result = decValidator.validate('wrong');

    expect(result.error).to.not.be.null;
    expect(result.error.name).to.be.equal('ValidationError');
    expect(result.error.message).to.be.equal('"wrong" is an invalid argument');
  });
});
