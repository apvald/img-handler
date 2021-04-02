'use strict';

module.exports = {
  /**
   * Is defined?
   * @private
   */
  defined: function (val) {
    return typeof val !== 'undefined' && val !== null;
  },

  /**
   * Is an object?
   * @private
   */
  object: function (val) {
    return typeof val === 'object';
  },

  /**
   * Is a function?
   * @private
   */
  fn: function (val) {
    return typeof val === 'function';
  },

  /**
   * Is a boolean?
   * @private
   */
  bool: function (val) {
    return typeof val === 'boolean';
  },

  /**
   * Is a buffer object?
   * @private
   */
  buffer: function (val) {
    return object(val) && val instanceof Buffer;
  },

  /**
   * Is a string?
   * @private
   */
  string: function (val) {
    return typeof val === 'string';
  },

  /**
   * Is a number?
   * @private
   */
  number: function (val) {
    return typeof val === 'number' && !Number.isNaN(val);
  },

  /**
   * Is an integer?
   * @private
   */
  integer: function (val) {
    return number(val) && val % 1 === 0;
  },

}