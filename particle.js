import {tiny, defs} from './examples/common.js';

// Pull these names into this module's scope for convenience:
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

export const Particle =
    class Particle {
        constructor(mass=1, posx=0, posy=0, posz=0, velx=0, vely=0,
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
            //this.g_acc = vec3(0,9.8,0);
        }

        update(dt) {
            if (!this.valid) {
                throw "Initialization not complete."

            }
            //this.ext_force = this.g_acc.times(this.mass);
            this.ext_force = vec3(0,0,0);
            const pb_top_origin = vec3(0,0.35,0);
            const pb_top_norm = vec3(0,-1,0);
            const top_origin_part_pos = pb_top_origin.minus(this.pos);
            const top_ks_ground_force = pb_top_norm.times((5000 * (top_origin_part_pos.dot(pb_top_norm))));
            const top_kd_ground_force = pb_top_norm.times((1 * (this.vel.dot(pb_top_norm))));
            const top_ground_force = top_ks_ground_force.minus(top_kd_ground_force);
            if(top_ground_force.dot(pb_top_norm) > 0){
                this.ext_force = this.ext_force.plus(top_ground_force);
            }
            const pb_left_origin = vec3(-0.35,0,0);
            const pb_left_norm = vec3(1,0,0);
            const l_origin_part_pos = pb_left_origin.minus(this.pos);
            const l_ks_ground_force = pb_left_norm.times((5000 * (l_origin_part_pos.dot(pb_left_norm))));
            const l_kd_ground_force = pb_left_norm.times((1 * (this.vel.dot(pb_left_norm))));
            const l_ground_force = l_ks_ground_force.minus(l_kd_ground_force);
            if(l_ground_force.dot(pb_left_norm) > 0){
                this.ext_force = this.ext_force.plus(l_ground_force);
            }
            const pb_bottom_origin = vec3(0,-9.35,0);
            const pb_bottom_norm = vec3(0,1,0);
            const b_origin_part_pos = pb_bottom_origin.minus(this.pos);
            const b_ks_ground_force = pb_bottom_norm.times((5000 * (b_origin_part_pos.dot(pb_bottom_norm))));
            const b_kd_ground_force = pb_bottom_norm.times((1 * (this.vel.dot(pb_bottom_norm))));
            const b_ground_force = b_ks_ground_force.minus(b_kd_ground_force);
            if(b_ground_force.dot(pb_bottom_norm) > 0){
                this.ext_force = this.ext_force.plus(b_ground_force);
            }
            const pb_right_origin = vec3(9.35,0,0);
            const pb_right_norm = vec3(-1,0,0);
            const r_origin_part_pos = pb_right_origin.minus(this.pos);
            const r_ks_ground_force = pb_right_norm.times((5000 * (r_origin_part_pos.dot(pb_right_norm))));
            const r_kd_ground_force = pb_right_norm.times((1 * (this.vel.dot(pb_right_norm))));
            const r_ground_force = r_ks_ground_force.minus(r_kd_ground_force);
            if(r_ground_force.dot(pb_right_norm) > 0){
                this.ext_force = this.ext_force.plus(r_ground_force);
            }
            const pb_back_origin = vec3(0,0,-1);
            const pb_back_norm = vec3(0,0,1);
            const bk_origin_part_pos = pb_back_origin.minus(this.pos);
            const bk_ks_ground_force = pb_back_norm.times((5000 * (bk_origin_part_pos.dot(pb_back_norm))));
            const bk_kd_ground_force = pb_back_norm.times((1 * (this.vel.dot(pb_back_norm))));
            const bk_ground_force = bk_ks_ground_force.minus(bk_kd_ground_force);
            if(bk_ground_force.dot(pb_back_norm) > 0){
                this.ext_force = this.ext_force.plus(bk_ground_force);
            }
            const pb_front_origin = vec3(0,0,1.9);
            const pb_front_norm = vec3(0,0,-1);
            const f_origin_part_pos = pb_front_origin.minus(this.pos);
            const f_ks_ground_force = pb_front_norm.times((5000 * (f_origin_part_pos.dot(pb_front_norm))));
            const f_kd_ground_force = pb_front_norm.times((1 * (this.vel.dot(pb_front_norm))));
            const f_ground_force = f_ks_ground_force.minus(f_kd_ground_force);
            if(f_ground_force.dot(pb_front_norm) > 0){
                this.ext_force = this.ext_force.plus(f_ground_force);
            }
            this.acc = this.ext_force.times(1 / this.mass);
            this.vel = this.vel.plus(this.acc.times(dt));
            this.pos = this.pos.plus(this.vel.times(dt));
        }

        set_pos(x,y,z){
            this.pos = vec3(x,y,z);
        }

        set_vel(vx,vy,vz){
            this.vel = vec3(vx, vy, vz);
        }

        set_acc(ax, ay, az){
            this.acc = vec3(ax, ay, az);
        }

        set_color(color){
            this.color = color;
        }

        draw(webgl_manager, uniforms, shapes, materials) {
            const blue =  color(0, 0, 1, 1), red = color(1, 0, 0,1);
            const pos = this.pos;
            let model_transform = Mat4.scale(0.2, 0.2, 0.2);
            model_transform.pre_multiply(Mat4.translation(pos[0], pos[1], pos[2]));
            console.log("color is " + this.color);
            shapes.ball.draw(webgl_manager, uniforms, model_transform, {...materials.plastic, color: this.color});
        }
    };