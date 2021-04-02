# img handler

The use for this Express Node.js module is to handle images by URL.

## Example

This needs to have [sharp](https://github.com/lovell/sharp) module installed previously.

```sh
npm install img-handler
```

```javascript
const imgHandler = require('img-handler');

app.use( '/path', imgHandler() );
// https://domain.com/path/(params)/image.jpg
```

## Setting

### Images Directory and Extension File

It's recommended always set 'dir' option

'ext' option will set the extension of the image file  

```javascript
app.use( '/path', imgHandler({
  dir: './images/', // default './images'
  ext: '.png' // default '.jpg'
}));

// recommended use of absolute path
app.use( '/path', imgHandler({
  dir: path.resolve('./images/')
}));
```

If the image extension is not in the url it will use the one set in the 'ext' option or default

### Parameters

This option will assign where the parameters to use will be getting from

```javascript
app.use( '/path', imgHandler({
  dir,
  params: 'route' // default: 'route', opts: ['route', 'query', 'none']
}));
```

*route* : `domain.com/path/{params}/image.jpg`

- domain&#46;com/path/**S**100x100**Q**90**F**w/image.jpg
- domain&#46;com/path/**W**100**H**100**Q**100**F**j/image

*query* : `domain.com/path/image.jpg?{params}`

- domain&#46;com/path/image.jpg?**s**=100x100&**Q**=90&**F**=w
- domain&#46;com/path/image?**H**=100&**W**=100&**q**=90&**f**=j

*none* : `domain.com/path/image.jpg`

#### **Options**

Options are simple letters, for 'route' param are uppercase letters, and 'query' param is not case sensitive

* **S** (size): resize image to width x height (values >= 10) 
* **W** (width): pixels wide the resultant image should be. Use null or undefined to auto-scale the width to match the height.
* **H** (height): pixels high the resultant image should be. Use null or undefined to auto-scale the height to match the width.
* **F** (format): force output to a given format (optional, default: 'jpeg')
* **Q** (quality): quality, integer 1-100 (optional)

'route' param can omit key "S" and just put the value.

Setting 'size' and, 'width' or 'height', the setted value will be that of 'size'.

Setting the same option more times, the setted value will be the first.

> domain&#46;com/path/100x100**F**w/image.jpg

#### **Formats and Qualities**

Formats are simple letters too. If not set the 'quality' option, it will take the default value for each one.

- j: jpeg, default quality: 80
- p: png, default quality: 100
- w: webp, default quality: 80
- t: tiff, default quality: 80
- a: avif, default quality: 50
- h: heif, default quality: 50
- r: raw
- g: gif

### More

Setting default values for each parameter, these will be assigned if no value has been setted for said option in 'route' or 'query', even for 'none'.

```javascript
app.use( '/path', imgHandler({
  dir,
  ext,
  params,
  defaults: {
    size: {
      width: 100,
      height: 100
    },
    format: {
      type: 'jpeg',
      options: {
        quality: 80
      }
    }
  }
}));
```

### Licensing

Copyright 2021 apvald.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
[https://www.apache.org/licenses/LICENSE-2.0](https://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
