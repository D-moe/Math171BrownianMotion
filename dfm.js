import {defs, tiny} from './examples/common.js';
const {vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component} =
    tiny;

export const DFM = class DFM {
  // This class will handle the params necessary for the discrete fluid model.
  // particles: Particle[], the particles to update on each step.
  constructor(a = 2, b = 1, alpha = 2, beta = 2, eps = 10e-6) {
    this.a = a;
    this.b = b;
    this.alpha = alpha;
    this.beta = beta;
    this.eps = eps;
  }
  // Could also initialize with all the particles we want to manage,
  // likely makes some sort of optimization to make more efficient.
  // This is the trivial way to perform the update.
  // Compute the forces using the Leonard-Jones force profile.
  // Lecture 7 Slide 10
  // g_ij = m_i* m_j *( alpha/(d_ij + epsilon) -beta/(d_ij + epsilon)^b)*d_ij
  // part_1: Particle, part_2: Particle
  LJ(part_1, part_2) {
    const m_1 = part_1.mass;
    const m_2 = part_2.mass;
    const x_1 = part_1.pos;
    const x_2 = part_2.pos;
    const dir = x_1.minus(x_2);
    const d = dir.norm();
    const f = dir.times(m_1 * m_2 *
        (this.alpha / Math.pow(d + this.eps, this.a) -
         this.beta / (Math.pow(d + this.eps, this.b)))*d);
    return f;
  }
  update(particles) {
    const prior_parts = Array.from(particles);
    console.log(particles.length);
    // Assume all other updated forces occur after this update.
    for (let i = 0; i < particles.length; i++) {
      let curr_part = particles[i];
      curr_part.ext_force = vec3(0,0,0);
      for (let j = 0; j < particles.length; j++) {
        let other_part = prior_parts[j];
        const force = this.LJ(curr_part, other_part);
       // console.log('The force is');
      //  console.log(force);
        particles[i].ext_force= curr_part.ext_force.plus(force);
      }
    }
  }
};