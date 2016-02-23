/**
 *---------------------------------------------------------------------
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Shahzeb Ihsan
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * ---------------------------------------------------------------------
 * @file Stitch canvases and HTML into a single canvas and export it as JPG/PNG.
 * @author Shahzeb Ihsan (shahzeb.ihsan@gmail.com)
 */

function CanvasStitcher () {
    this.svgHead =
        'data:image/svg+xml,' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">' +
            '<foreignObject width="100%" height="100%">' +
                '<div xmlns="http://www.w3.org/1999/xhtml" style="font-size:40px">'

    this.svgTail =
                '</div>' +
            '</foreignObject>' +
        '</svg>';

    this.buffer = 10;

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.canvas.height = 0;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.fillStyle = 'white';

    this.tmpCanvas = document.createElement('canvas');
    this.tmpCtx = this.tmpCanvas.getContext('2d');
    this.tmpCtx.fillStyle = 'white';
}

CanvasStitcher.prototype.__private__ = function() {
    var self = this;
    function backupMainCanvas() {
        self.tmpCanvas.width = self.canvas.width;
        self.tmpCanvas.height = self.canvas.height;

        self.tmpCtx = self.tmpCanvas.getContext('2d');
        self.tmpCtx.fillStyle = 'white';
        self.tmpCtx.fillRect(0, 0, self.tmpCanvas.width, self.tmpCanvas.height);
        self.tmpCtx.drawImage(self.canvas, 0, 0);
    }

    function restoreMainCanvas() {
        self.ctx = self.canvas.getContext('2d');
        self.ctx.fillStyle = 'white';
        self.ctx.fillRect(0, 0, self.canvas.width, self.canvas.height);
        self.ctx.drawImage(self.tmpCanvas, 0, 0);
    }

    function buildSvgImageUrl(url) {
        return url;
    }

    function loadSvgImage(url, callback) {
        var image = new window.Image();

        image.onload = function() {
            callback(image);
        };

        image.src = url;
    }

    return {
        backupMainCanvas: backupMainCanvas,
        restoreMainCanvas: restoreMainCanvas,
        buildSvgImageUrl: buildSvgImageUrl,
        loadSvgImage: loadSvgImage
    };
}

CanvasStitcher.prototype.appendHTML = function (html, callback) {
    var self = this;

    this.__private__()['backupMainCanvas']();

    data = this.svgHead + html + this.svgTail;
    this.__private__()['loadSvgImage'](
                this.__private__()['buildSvgImageUrl'](data),
                function (image) {
                    var y = self.canvas.height + self.buffer;
                    self.canvas.height += image.height + self.buffer;

                    self.__private__()['restoreMainCanvas']();
                    self.ctx.drawImage(image, 0, y);
                    callback(self);
                }
    );
}

CanvasStitcher.prototype.appendCanvas = function (canvas) {
    this.__private__()['backupMainCanvas']();

    if (this.canvas.width < canvas.width)
        this.canvas.width = canvas.width;

    var y = this.canvas.height + this.buffer;
    this.canvas.height += canvas.height + this.buffer;

    this.__private__()['restoreMainCanvas']();
    this.ctx.drawImage(canvas, 0, y);

}

CanvasStitcher.prototype.exportToJpg = function(quality) {
    return this.canvas.toDataURL("image/jpeg", quality);
}
