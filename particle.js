import {tiny, defs} from './examples/common.js';

// Pull these names into this module's scope for convenience:
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

export const Particle =
    class Particle {
        constructor() {
            this.mass = 0;
            this.pos = vec3(0, 0, 0);
            this.vel = vec3(0, 0, 0);
            this.acc = vec3(0, 0, 0);
            this.ext_force = vec3(0, 0, 0);
            this.valid = false;
        }

        update(dt) {
            if (!this.valid) {
                throw "Initialization not complete."

            }
            this.acc = this.ext_force.times(1 / this.mass);
            this.vel = this.vel.plus(this.acc.times(dt));
            this.pos = this.pos.plus(this.vel.times(dt));
        }

        draw(webgl_manager, uniforms, shapes, materials) {
            const blue =  color(0, 0, 1, 1), red = color(1, 0, 0,1);
            const pos = this.pos;
            let model_transform = Mat4.scale(0.2, 0.2, 0.2);
            model_transform.pre_multiply(Mat4.translation(pos[0], pos[1], pos[2]));
            shapes.ball.draw(webgl_manager, uniforms, model_transform, {...materials.plastic, color: blue});
        }
    };