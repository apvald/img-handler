'use strict'

/**
 * Module dependencies.
 * @private
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const is = require('./is');

/**
 * Module exports.
 * @public
 */

module.exports = imgHandler;

/**
 * Enum for image formats
 * @readonly
 * @typedef {'jpeg'|'png'|'webp'|'gif'|'tiff'|'avif'|'heif'|'raw'} _FORMATS
 */
const _FORMATS = {
  j: 'jpeg',
  p: 'png',
  w: 'webp',
  g: 'gif',
  t: 'tiff',
  a: 'avif',
  h: 'heif',
  r: 'raw',
};
/**
 * PARAMATERS
 * @typedef {('route'|'query'|'none')} _PARAMS 
 */
/**
 * @param {Object} [options] Options 
 * @param {string} [options.ext=".jpg"] Define file extension
 * @param {string} [options.dir="./images"] Define path to directory where images are
 * @param {_PARAMS} [options.params="route"] Where we get parameters: 'query', from queries; 'route', from route parameters and 'none', to not use parameters.
 * @param {Object} [options.defaults] Define defaults parameters, even params is none.
 * @param {Object} [options.defaults.size] set size for resize image
 * @param {number} [options.defaults.size.height] set height for resize
 * @param {number} [options.defaults.size.width] set width for resize
 * @param {Object} [options.defaults.format]  set format for image output
 * @param {_FORMATS} [options.defaults.format.type] set format type for image output
 * @param {Object} [options.defaults.format.options] set format options for image output
 * @param {number} [options.defaults.format.options.quality] set format quality option for image output
 * @return {Function}
 * @public
 */

function imgHandler(options) {

  const opts = options || {};

  const _ext = ((v)=>{
    let ext = '.jpg';
    if( is.string(v) && v.trim() ){
      ext = v.trim().toLowerCase()
      if( v.match(/^\.[a-z]{3,4}$/) ) {
        ext = v;
      } else if( v.match(/^[a-z]{3,4}$/) ) {
        ext = `.${v}`;
      } else{
        ext = '.jpg'
      }
    }
    return ext;
  })(opts.ext)

  const _dir = ( is.string(opts.dir) && (opts.dir.trim()) ) ? path.resolve(opts.dir).trim() : path.resolve('./images');

  const _params = ( is.string(opts.params) && (opts.params.trim() == 'query' || opts.params.trim() == 'none') ) ? opts.params.trim() : 'route';

  const _defaults = ( is.object(opts.defaults) ) ? opts.defaults : null ;
  
  /* function middleware */
  return async function framer(req, res, next) {
    try {

      const url = new URL(req.originalUrl, `${req.headers.protocol}://${req.headers.host}`);
      const urlpath = url.pathname;
      
      const match = urlpath.match( new RegExp(`^(?<baseUrl>${req.baseUrl})\/(?<rest>.+)`) );
      if( !match ) return next();

      let rest = match.groups.rest.split('/');
      const filename = rest.pop();

      const params = ( _params === 'route') ? rest.pop()
        : ( ( _params === 'query' ) ? Object.fromEntries(url.searchParams.entries()) : undefined );
      
      const ps = getParams(params);
      let qu = Object.entries(ps).reduce( (acc, [key, val]) => {
        fns[key].call(acc, val);
        return acc;
      }, {});

      const filePathParsed = path.parse( path.resolve( _dir, filename )) ;
      delete filePathParsed.base;
      
      if ( !is.defined(filePathParsed.ext) || filePathParsed.ext == '') filePathParsed.ext = _ext;
      const filepath = path.format( filePathParsed );
      
      // SHARP OBJECT
      let file = sharp(fs.readFileSync(filepath));

      // SHARP IT
      if( qu.resize || _defaults?.size ) file.resize( qu.resize || _defaults.size);
      if( qu.toFormat || ( _defaults?.format?.type || _defaults?.format?.options ) ){
        file.toFormat(
          (qu.toFormat?.format || _defaults.format.type) || 'jpeg',
          qu.toFormat?.options || _defaults.format.options
        );
      }

      const image = await file.toBuffer();
      res.end(image);

    } catch (error) {
      let err = error;
      if(error.code == 'ENOENT'){
        err = new Error('Image not found');
        err.code = 'IMAGEMSNOTFOUND';
      }
      next(err)
    }
  }
}
/**
 * getParams 
 * @param {(string|Object)} params set parameters to sharp
 * @returns {Object}
 */
function getParams(params) {
  if ( is.object(params) )
    return Object.entries(params).reduce(( acc, [ key, val] )=>{
      key = key.toLowerCase();
      val = val.toLowerCase();
      if( !acc[key] ) acc[key] = val;
      return acc;
    }, {});
  if ( is.string(params) )
    return Array.from(
      (params || '').matchAll(/(?<s>-?S?_?(?<wxh>(\d{2,})[xX](\d{2,})))|-?((?<key>[A-Z]{1})_?(?<val>[a-z]|\d{2,}))/g),
      ({groups: g}) => ( g.s ? ['s', g.wxh.toLowerCase()] : [g.key.toLowerCase(), g.val.toLowerCase()] )
    ).reduce(( acc, [key, val])=>{
      if ( !acc[key] ) acc[key] = val;
      return acc;
    }, {});
  return {};
}

/**
 * Enum functions for sharp methods
 * @enum {Function}
 */
const fns = {
  s: function (v) {
    const size = v.match(/(?<width>\d{2,})[xX](?<height>\d{2,})/);
    if( !size ) return false;
    const { width, height } = size.groups;
    this.resize = {width: parseInt(width), height: parseInt(height)}
  },
  f: function (v) {
    if ( !(is.string(v)) ) return false;
    if ( !this.toFormat ) this.toFormat = {};
    this.toFormat.format = _FORMATS[v] || 'jpg';
  },
  q: function (v) {
    const quality = parseInt(v);
    if ( !(is.integer(quality) || quality > 0)  ) return false;
    if ( !this.toFormat ) this.toFormat = {};
    if ( !this.toFormat.options ) this.toFormat.options = {};
    this.toFormat.options.quality = quality;
  },
  h: function (v) {
    const height = parseInt(v);
    if ( !(is.integer(height) || height >= 10) ) return false;
    if( !this.resize ) this.resize = {};
    if( !this.resize.height ) this.resize.height = height ;
  },
  w: function (v) {
    const width = parseInt(v);
    if ( !(is.integer(width) || width >= 10) ) return false;
    if( !this.resize ) this.resize = {};
    if( !this.resize.width ) this.resize.width = width ;
  }
}