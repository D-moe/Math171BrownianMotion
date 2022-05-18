import {tiny, defs} from './examples/common.js';

// Pull these names into this module's scope for convenience:
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

export const Particle =
    class Particle {
        constructor(mass=0, posx=0, posy=0, posz=0, velx=0, vely=0,
                    velz=0, accx = 0, accy=0, accz=0,
                    extx=0, exty=0, extz=0,
                    col0=0, col1=0, col2=1, col3=1) {
            this.mass = mass;
            this.pos = vec3(posx, posy, posz);
            this.vel = vec3(velx, vely, velz);
            this.acc = vec3(accx, accy, accz);
            this.ext_force = vec3(extx, exty, extz);
            this.color = color(col0, col1, col2, col3)
            this.valid = true;
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
            shapes.ball.draw(webgl_manager, uniforms, model_transform, {...materials.plastic, color: this.color});
        }
    };