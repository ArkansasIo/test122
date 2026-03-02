/**
 * Shader System
 * WebGL shader support for visual effects and advanced rendering
 */

class Shader {
  constructor(vertexSource, fragmentSource) {
    this.vertexSource = vertexSource;
    this.fragmentSource = fragmentSource;
    this.program = null;
    this.uniforms = new Map();
    this.attributes = new Map();
  }

  compile(gl) {
    try {
      const vertexShader = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vertexShader, this.vertexSource);
      gl.compileShader(vertexShader);

      if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        throw new Error('Vertex shader failed: ' + gl.getShaderInfoLog(vertexShader));
      }

      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fragmentShader, this.fragmentSource);
      gl.compileShader(fragmentShader);

      if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        throw new Error('Fragment shader failed: ' + gl.getShaderInfoLog(fragmentShader));
      }

      this.program = gl.createProgram();
      gl.attachShader(this.program, vertexShader);
      gl.attachShader(this.program, fragmentShader);
      gl.linkProgram(this.program);

      if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        throw new Error('Program linking failed: ' + gl.getProgramInfoLog(this.program));
      }

      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);

      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  use(gl) {
    gl.useProgram(this.program);
  }

  setUniform(gl, name, value) {
    const location = gl.getUniformLocation(this.program, name);
    this.uniforms.set(name, { location, value });

    if (typeof value === 'number') {
      gl.uniform1f(location, value);
    } else if (typeof value === 'object' && value.length === 2) {
      gl.uniform2f(location, value[0], value[1]);
    } else if (typeof value === 'object' && value.length === 3) {
      gl.uniform3f(location, value[0], value[1], value[2]);
    } else if (typeof value === 'object' && value.length === 4) {
      gl.uniform4f(location, value[0], value[1], value[2], value[3]);
    } else if (typeof value === 'object' && value.length > 4) {
      gl.uniformMatrix4fv(location, false, value);
    }
  }

  setAttribute(gl, name, size, buffer) {
    const location = gl.getAttribLocation(this.program, name);
    this.attributes.set(name, { location, size, buffer });

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(location);
  }
}

class ShaderLibrary {
  static createColorShader() {
    const vertex = `
      attribute vec2 position;
      attribute vec4 color;
      varying vec4 vColor;
      uniform mat4 projection;

      void main() {
        gl_Position = projection * vec4(position, 0.0, 1.0);
        vColor = color;
      }
    `;

    const fragment = `
      precision mediump float;
      varying vec4 vColor;

      void main() {
        gl_FragColor = vColor;
      }
    `;

    return new Shader(vertex, fragment);
  }

  static createTextureShader() {
    const vertex = `
      attribute vec2 position;
      attribute vec2 texCoord;
      varying vec2 vTexCoord;
      uniform mat4 projection;

      void main() {
        gl_Position = projection * vec4(position, 0.0, 1.0);
        vTexCoord = texCoord;
      }
    `;

    const fragment = `
      precision mediump float;
      uniform sampler2D texture;
      varying vec2 vTexCoord;

      void main() {
        gl_FragColor = texture2D(texture, vTexCoord);
      }
    `;

    return new Shader(vertex, fragment);
  }

  static createBloomShader() {
    const vertex = `
      attribute vec2 position;
      varying vec2 vPosition;
      uniform mat4 projection;

      void main() {
        gl_Position = projection * vec4(position, 0.0, 1.0);
        vPosition = position;
      }
    `;

    const fragment = `
      precision mediump float;
      uniform sampler2D texture;
      uniform float threshold;
      varying vec2 vPosition;

      void main() {
        vec4 color = texture2D(texture, vPosition);
        float brightness = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        if (brightness > threshold) {
          gl_FragColor = color;
        } else {
          gl_FragColor = vec4(0.0);
        }
      }
    `;

    return new Shader(vertex, fragment);
  }

  static createBlurShader() {
    const vertex = `
      attribute vec2 position;
      varying vec2 vPosition;
      uniform mat4 projection;

      void main() {
        gl_Position = projection * vec4(position, 0.0, 1.0);
        vPosition = position;
      }
    `;

    const fragment = `
      precision mediump float;
      uniform sampler2D texture;
      uniform vec2 textureSize;
      uniform float radius;
      varying vec2 vPosition;

      void main() {
        vec4 color = vec4(0.0);
        float total = 0.0;

        for (float x = -4.0; x <= 4.0; x += 1.0) {
          for (float y = -4.0; y <= 4.0; y += 1.0) {
            float weight = 1.0 / (1.0 + length(vec2(x, y)));
            color += texture2D(texture, vPosition + vec2(x, y) * radius / textureSize) * weight;
            total += weight;
          }
        }

        gl_FragColor = color / total;
      }
    `;

    return new Shader(vertex, fragment);
  }

  static createDistortionShader() {
    const vertex = `
      attribute vec2 position;
      varying vec2 vPosition;
      uniform mat4 projection;

      void main() {
        gl_Position = projection * vec4(position, 0.0, 1.0);
        vPosition = position;
      }
    `;

    const fragment = `
      precision mediump float;
      uniform sampler2D texture;
      uniform float time;
      varying vec2 vPosition;

      void main() {
        vec2 coord = vPosition;
        coord.x += sin(coord.y * 10.0 + time) * 0.05;
        coord.y += cos(coord.x * 10.0 + time) * 0.05;
        gl_FragColor = texture2D(texture, coord);
      }
    `;

    return new Shader(vertex, fragment);
  }
}

class ShaderPass {
  constructor(shader, inputTexture = null) {
    this.shader = shader;
    this.inputTexture = inputTexture;
    this.outputTexture = null;
    this.framebuffer = null;
    this.parameters = {};
  }

  setParameter(name, value) {
    this.parameters[name] = value;
  }

  render(gl, width, height) {
    this.shader.use(gl);

    // Set uniforms
    for (let [name, value] of Object.entries(this.parameters)) {
      this.shader.setUniform(gl, name, value);
    }

    // Draw fullscreen quad
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  serialize() {
    return {
      shaderName: this.shader.constructor.name,
      parameters: this.parameters,
      version: '1.0'
    };
  }
}

class PostProcessPipeline {
  constructor() {
    this.passes = [];
    this.gl = null;
    this.width = 0;
    this.height = 0;
  }

  addPass(pass) {
    this.passes.push(pass);
    return pass;
  }

  removePass(index) {
    this.passes.splice(index, 1);
  }

  getPass(index) {
    return this.passes[index];
  }

  execute(gl, inputTexture, width, height) {
    this.gl = gl;
    this.width = width;
    this.height = height;

    let currentTexture = inputTexture;

    for (let i = 0; i < this.passes.length; i++) {
      const pass = this.passes[i];
      pass.inputTexture = currentTexture;

      if (i < this.passes.length - 1) {
        // Create intermediate framebuffer
        const fb = gl.createFramebuffer();
        const texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

        pass.render(gl, width, height);

        currentTexture = texture;
        pass.outputTexture = texture;
      } else {
        // Final pass renders to screen
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        pass.render(gl, width, height);
      }
    }
  }

  serialize() {
    return {
      passes: this.passes.map(p => p.serialize()),
      passCount: this.passes.length,
      version: '1.0'
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Shader, ShaderLibrary, ShaderPass, PostProcessPipeline };
}
