'use strict';

/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-self-compare */
/* eslint-disable no-restricted-properties */
/* eslint-disable no-bitwise */

const { expect } = require('chai');

const BaseJoi = require('@hapi/joi');
const Decimal = require('decimal.js');
const DecimalExtension = require('..');

const Joi = BaseJoi.extend(DecimalExtension);

const shouldEqual = (expected, value) => {
  it('should convert and equal', () => {
    const decValidator = Joi.decimal();

    const result = decValidator.validate(value);

    expect(result.error).to.be.null;
    expect(result.value).to.be.instanceof(Decimal);

    expect(result.value.valueOf()).to.satisfy((val) => {
      // If expected and actual are both NaN, consider them equal.
      if (expected === val || (expected !== expected && val !== val)) {
        return true;
      }
      return false;
    });
  });
};

const shouldDeepEqual = (coefficient, exponent, sign, value) => {
  it('should convert and deep equal', () => {
    const decValidator = Joi.decimal();

    const result = decValidator.validate(value);

    expect(result.error).to.be.null;
    expect(result.value).to.be.instanceof(Decimal);

    let i = 0;
    const len = coefficient.length;

    while (i < len && coefficient[i] === result.value.d[i]) i += 1;
    expect(result.value.d.length).to.be.equal(i);
    expect(result.value.e).to.be.equal(exponent);
    expect(result.value.s).to.be.equal(sign);
  });
};

const shouldFail = (value, expected) => {
  it('should fail to convert and return an error', () => {
    const decValidator = Joi.decimal();

    const result = decValidator.validate(value);

    expect(result.error).to.not.be.null;
    expect(result.error.name).to.be.equal('ValidationError');
    if (expected) expect(result.error.message).to.be.equal(`${expected} is not a Decimal or could not be cast to a Decimal`);
    else expect(result.error.message).to.match(/is not a Decimal or could not be cast to a Decimal/);
  });
};


describe('decimal - convert', () => {
  before(() => {
    Decimal.set({ defaults: true });

    Decimal.config({
      precision: 20,
      rounding: 4,
      toExpNeg: -9e15,
      toExpPos: 9e15,
      minE: -9e15,
      maxE: 9e15,
    });
  });

  it('should not convert if conversion is disabled', () => {
    const decValidator = Joi.decimal();

    const result = decValidator.validate('100', { convert: false });

    expect(result.error).to.be.null;
    expect(result.value).to.be.string('100');
  });


  // tests from decimal.js documentation
  shouldEqual('100', '100');
  // Edited this test because we use a different config than the one from docs.
  shouldEqual('5032485723458348569331745.33434346346912144534543', '5032485723458348569331745.33434346346912144534543');
  // shouldEqual('5.03248572345834856933174533434346346912144534543e+24', '5032485723458348569331745.33434346346912144534543');
  shouldEqual('43210', '4.321e+4');
  // Edited this test because we use a different config than the one from docs.
  shouldEqual('-0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007350918', '-735.0918e-430');
  // shouldEqual('-7.350918e-428', '-735.0918e-430');
  shouldEqual('5.67', '5.6700000');
  shouldEqual('Infinity', Infinity);
  shouldEqual('NaN', 'NaN');
  shouldEqual('0.5', '.5');
  shouldEqual('-180.5', '-0b10110100.1');
  shouldEqual('255.5', '0xff.8');
  shouldEqual('0.046875', 0.046875);
  shouldEqual('0.046875', '0.046875000000');
  shouldEqual('0.046875', 4.6875e-2);
  shouldEqual('0.046875', '468.75e-4');
  shouldEqual('0.046875', '0b0.000011');
  shouldEqual('0.046875', '0o0.03');
  shouldEqual('0.046875', '0x0.0c');
  shouldEqual('0.046875', '0b1.1p-5');
  shouldEqual('0.046875', '0o1.4p-5');
  shouldEqual('0.046875', '0x1.8p-5');


  // tests from decimal.js
  shouldDeepEqual([0], 0, 1, 0);
  shouldDeepEqual([0], 0, -1, -0);
  shouldDeepEqual([1], 0, -1, -1);
  shouldDeepEqual([10], 1, -1, -10);

  shouldDeepEqual([1], 0, 1, 1);
  shouldDeepEqual([10], 1, 1, 10);
  shouldDeepEqual([100], 2, 1, 100);
  shouldDeepEqual([1000], 3, 1, 1000);
  shouldDeepEqual([10000], 4, 1, 10000);
  shouldDeepEqual([100000], 5, 1, 100000);
  shouldDeepEqual([1000000], 6, 1, 1000000);

  shouldDeepEqual([1], 7, 1, 10000000);
  shouldDeepEqual([10], 8, 1, 100000000);
  shouldDeepEqual([100], 9, 1, 1000000000);
  shouldDeepEqual([1000], 10, 1, 10000000000);
  shouldDeepEqual([10000], 11, 1, 100000000000);
  shouldDeepEqual([100000], 12, 1, 1000000000000);
  shouldDeepEqual([1000000], 13, 1, 10000000000000);

  shouldDeepEqual([1], 14, -1, -100000000000000);
  shouldDeepEqual([10], 15, -1, -1000000000000000);
  shouldDeepEqual([100], 16, -1, -10000000000000000);
  shouldDeepEqual([1000], 17, -1, -100000000000000000);
  shouldDeepEqual([10000], 18, -1, -1000000000000000000);
  shouldDeepEqual([100000], 19, -1, -10000000000000000000);
  shouldDeepEqual([1000000], 20, -1, -100000000000000000000);

  shouldDeepEqual([1000000], -1, 1, 1e-1);
  shouldDeepEqual([100000], -2, -1, -1e-2);
  shouldDeepEqual([10000], -3, 1, 1e-3);
  shouldDeepEqual([1000], -4, -1, -1e-4);
  shouldDeepEqual([100], -5, 1, 1e-5);
  shouldDeepEqual([10], -6, -1, -1e-6);
  shouldDeepEqual([1], -7, 1, 1e-7);

  shouldDeepEqual([1000000], -8, 1, 1e-8);
  shouldDeepEqual([100000], -9, -1, -1e-9);
  shouldDeepEqual([10000], -10, 1, 1e-10);
  shouldDeepEqual([1000], -11, -1, -1e-11);
  shouldDeepEqual([100], -12, 1, 1e-12);
  shouldDeepEqual([10], -13, -1, -1e-13);
  shouldDeepEqual([1], -14, 1, 1e-14);

  shouldDeepEqual([1000000], -15, 1, 1e-15);
  shouldDeepEqual([100000], -16, -1, -1e-16);
  shouldDeepEqual([10000], -17, 1, 1e-17);
  shouldDeepEqual([1000], -18, -1, -1e-18);
  shouldDeepEqual([100], -19, 1, 1e-19);
  shouldDeepEqual([10], -20, -1, -1e-20);
  shouldDeepEqual([1], -21, 1, 1e-21);

  shouldDeepEqual([9], 0, 1, '9');
  shouldDeepEqual([99], 1, -1, '-99');
  shouldDeepEqual([999], 2, 1, '999');
  shouldDeepEqual([9999], 3, -1, '-9999');
  shouldDeepEqual([99999], 4, 1, '99999');
  shouldDeepEqual([999999], 5, -1, '-999999');
  shouldDeepEqual([9999999], 6, 1, '9999999');

  shouldDeepEqual([9, 9999999], 7, -1, '-99999999');
  shouldDeepEqual([99, 9999999], 8, 1, '999999999');
  shouldDeepEqual([999, 9999999], 9, -1, '-9999999999');
  shouldDeepEqual([9999, 9999999], 10, 1, '99999999999');
  shouldDeepEqual([99999, 9999999], 11, -1, '-999999999999');
  shouldDeepEqual([999999, 9999999], 12, 1, '9999999999999');
  shouldDeepEqual([9999999, 9999999], 13, -1, '-99999999999999');

  shouldDeepEqual([9, 9999999, 9999999], 14, 1, '999999999999999');
  shouldDeepEqual([99, 9999999, 9999999], 15, -1, '-9999999999999999');
  shouldDeepEqual([999, 9999999, 9999999], 16, 1, '99999999999999999');
  shouldDeepEqual([9999, 9999999, 9999999], 17, -1, '-999999999999999999');
  shouldDeepEqual([99999, 9999999, 9999999], 18, 1, '9999999999999999999');
  shouldDeepEqual([999999, 9999999, 9999999], 19, -1, '-99999999999999999999');
  shouldDeepEqual([9999999, 9999999, 9999999], 20, 1, '999999999999999999999');

  function randInt() {
    return Math.floor(Math.random() * 0x20000000000000 / Math.pow(10, Math.random() * 16 | 0));
  }

  // Test random integers against Number.prototype.toString(base).
  for (let k, i = 0; i < 127; i += 1) {
    k = randInt();
    shouldEqual(k.toString(), `0b${k.toString(2)}`);
    k = randInt();
    shouldEqual(k.toString(), `0B${k.toString(2)}`);
    k = randInt();
    shouldEqual(k.toString(), `0o${k.toString(8)}`);
    k = randInt();
    shouldEqual(k.toString(), `0O${k.toString(8)}`);
    k = randInt();
    shouldEqual(k.toString(), `0x${k.toString(16)}`);
    k = randInt();
    shouldEqual(k.toString(), `0X${k.toString(16)}`);
  }

  // Binary.
  shouldEqual('0', '0b0');
  shouldEqual('0', '0B0');
  shouldEqual('-5', '-0b101');
  shouldEqual('5', '+0b101');
  shouldEqual('1.5', '0b1.1');
  shouldEqual('-1.5', '-0b1.1');

  shouldEqual('18181', '0b100011100000101.00');
  shouldEqual('-12.5', '-0b1100.10');
  shouldEqual('343872.5', '0b1010011111101000000.10');
  shouldEqual('-328.28125', '-0b101001000.010010');
  shouldEqual('-341919.144535064697265625', '-0b1010011011110011111.0010010100000000010');
  shouldEqual('97.10482025146484375', '0b1100001.000110101101010110000');
  shouldEqual('-120914.40625', '-0b11101100001010010.01101');
  shouldEqual('8080777260861123367657', '0b1101101100000111101001111111010001111010111011001010100101001001011101001');

  // Octal.
  shouldEqual('8', '0o10');
  shouldEqual('-8.5', '-0O010.4');
  shouldEqual('8.5', '+0O010.4');
  shouldEqual('-262144.000000059604644775390625', '-0o1000000.00000001');
  shouldEqual('572315667420.390625', '0o10250053005734.31');

  // Hex.
  shouldEqual('1', '0x00001');
  shouldEqual('255', '0xff');
  shouldEqual('-15.5', '-0Xf.8');
  shouldEqual('15.5', '+0Xf.8');
  shouldEqual('-16777216.00000000023283064365386962890625', '-0x1000000.00000001');
  shouldEqual('325927753012307620476767402981591827744994693483231017778102969592507', '0xc16de7aa5bf90c3755ef4dea45e982b351b6e00cd25a82dcfe0646abb');

  // Test parsing.
  shouldEqual('NaN', NaN);
  shouldEqual('NaN', -NaN);
  shouldEqual('NaN', 'NaN');
  shouldEqual('NaN', '-NaN');
  shouldEqual('NaN', '+NaN');

  shouldFail(' NaN', '" NaN"');
  shouldFail('NaN ', '"NaN "');
  shouldFail(' NaN ', '" NaN "');
  shouldFail(' -NaN', '" -NaN"');
  shouldFail(' +NaN', '" +NaN"');
  shouldFail('-NaN ', '"-NaN "');
  shouldFail('+NaN ', '"+NaN "');
  shouldFail('.NaN', '".NaN"');
  shouldFail('NaN.', '"NaN."');

  shouldEqual('Infinity', Infinity);
  shouldEqual('-Infinity', -Infinity);
  shouldEqual('Infinity', 'Infinity');
  shouldEqual('-Infinity', '-Infinity');
  shouldEqual('Infinity', '+Infinity');

  // shouldFail(' Infinity', '" Infinity "');
  shouldFail('Infinity ', '"Infinity "');
  shouldFail(' Infinity ', '" Infinity "');
  shouldFail(' -Infinity', '" -Infinity"');
  shouldFail(' +Infinity', '" +Infinity"');
  shouldFail('.Infinity', '".Infinity"');
  shouldFail('Infinity.', '"Infinity."');

  shouldEqual('0', 0);
  shouldEqual('-0', -0);
  shouldEqual('0', '0');
  shouldEqual('-0', '-0');
  shouldEqual('0', '0.');
  shouldEqual('-0', '-0.');
  shouldEqual('0', '0.0');
  shouldEqual('-0', '-0.0');
  shouldEqual('0', '0.00000000');
  shouldEqual('-0', '-0.0000000000000000000000');

  shouldFail(' 0', '" 0"');
  shouldFail('0 ', '"0 "');
  shouldFail(' 0 ', '" 0 "');
  shouldFail('0-', '"0-"');
  shouldFail(' -0', '" -0"');
  shouldFail('-0 ', '"-0 "');
  shouldFail('+0 ', '"+0 "');
  shouldFail(' +0', '" +0"');
  shouldFail(' .0', '" .0"');
  shouldFail('0. ', '"0. "');
  shouldFail('+-0', '"+-0"');
  shouldFail('-+0', '"-+0"');
  shouldFail('--0', '"--0"');
  shouldFail('++0', '"++0"');
  shouldFail('.-0', '".-0"');
  shouldFail('.+0', '".+0"');
  shouldFail('0 .', '"0 ."');
  shouldFail('. 0', '". 0"');
  shouldFail('..0', '"..0"');
  shouldFail('+.-0', '"+.-0"');
  shouldFail('-.+0', '"-.+0"');
  shouldFail('+. 0', '"+. 0"');
  shouldFail('.0.', '".0."');

  shouldEqual('1', 1);
  shouldEqual('-1', -1);
  shouldEqual('1', '1');
  shouldEqual('-1', '-1');
  shouldEqual('0.1', '.1');
  shouldEqual('0.1', '.1');
  shouldEqual('-0.1', '-.1');
  shouldEqual('0.1', '+.1');
  shouldEqual('1', '1.');
  shouldEqual('1', '1.0');
  shouldEqual('-1', '-1.');
  shouldEqual('1', '+1.');
  shouldEqual('-1', '-1.0000');
  shouldEqual('1', '1.0000');
  shouldEqual('1', '1.00000000');
  shouldEqual('-1', '-1.000000000000000000000000');
  shouldEqual('1', '+1.000000000000000000000000');

  shouldFail(' 1', '" 1"');
  shouldFail('1 ', '"1 "');
  shouldFail(' 1 ', '" 1 "');
  shouldFail('1-', '"1-"');
  shouldFail(' -1', '" -1"');
  shouldFail('-1 ', '"-1 "');
  shouldFail(' +1', '" +1"');
  // shouldFail('+1 ', '"+1"');
  shouldFail('.1.', '".1."');
  shouldFail('+-1', '"+-1"');
  shouldFail('-+1', '"-+1"');
  shouldFail('--1', '"--1"');
  shouldFail('++1', '"++1"');
  shouldFail('.-1', '".-1"');
  shouldFail('.+1', '".+1"');
  shouldFail('1 .', '"1 ."');
  shouldFail('. 1', '". 1"');
  shouldFail('..1', '"..1"');
  shouldFail('+.-1', '"+.-1"');
  shouldFail('-.+1', '"-.+1"');
  shouldFail('+. 1', '"+. 1"');
  shouldFail('-. 1', '"-. 1"');
  shouldFail('1..', '"1.."');
  shouldFail('+1..', '"+1.."');
  shouldFail('-1..', '"-1.."');
  shouldFail('-.1.', '"-.1."');
  shouldFail('+.1.', '"+.1."');
  shouldFail('.-10.', '".-10."');
  shouldFail('.+10.', '".+10."');
  shouldFail('. 10.', '". 10."');

  shouldEqual('123.456789', 123.456789);
  shouldEqual('-123.456789', -123.456789);
  shouldEqual('-123.456789', '-123.456789');
  shouldEqual('123.456789', '123.456789');
  shouldEqual('123.456789', '+123.456789');

  // shouldFail(void 0, '"void 0"');
  shouldFail('undefined', '"undefined"');
  shouldFail(null, '"null"');
  shouldFail('null', '"null"');
  // shouldFail({}, '"{}"');
  shouldFail({}, '"[object Object]"');
  shouldFail([], '"[]"');
  shouldFail((() => {}), '"() => {}"');
  // shouldFail(new Date(), 'new Date');
  // shouldFail(new RegExp(), 'new RegExp');
  shouldFail('', '""');
  shouldFail(' ', '" "');
  shouldFail('nan', '"nan"');
  shouldFail('23e', '"23e"');
  shouldFail('e4', '"e4"');
  shouldFail('ff', '"ff"');
  // shouldFail('0xg', '"oxg"');
  shouldFail('0Xfi', '"0Xfi"');
  shouldFail('++45', '"++45"');
  shouldFail('--45', '"--45"');
  shouldFail('9.99--', '"9.99--"');
  shouldFail('9.99++', '"9.99++"');
  shouldFail('0 0', '"0 0"');
});
