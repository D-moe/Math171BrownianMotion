import {defs, tiny} from './examples/common.js';
import {get_readers, save_to_canvas} from './image_loader.js'
import {Particle} from './particle.js';

// Pull these names into this module's scope for convenience:
const {vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component} =
    tiny;

export const project_base = defs.project_base =
    class Part_two_spring_base extends
    Component {  // **My_Demo_Base** is a Scene that can be added to any display
                 // canvas. This particular scene is broken up into two pieces
                 // for easier understanding. The piece here is the base class,
                 // which sets up the machinery to draw a simple scene
                 // demonstrating a few concepts.  A subclass of it,
                 // Part_one_hermite, exposes only the display() method, which
                 // actually places and draws the shapes, isolating that code so
                 // it can be experimented with on its own.
  init() {
    console.log('init');
    // At the beginning of our program, load one of each of these shape
    // definitions onto the GPU.  NOTE:  Only do this ONCE per shape it
    // would be redundant to tell it again.  You should just re-use the
    // one called "box" more than once in display() to draw multiple cubes.
    // Don't define more than one blueprint for the same thing here.
    this.shapes = {
      'box': new defs.Cube(),
      'ball': new defs.Subdivision_Sphere(4),
      'axis': new defs.Axis_Arrows()
    };

    // *** Materials: ***  A "material" used on individual shapes specifies all
    // fields that a Shader queries to light/color it properly.  Here we use a
    // Phong shader. We can now tweak the scalar coefficients from the Phong
    // lighting formulas. Expected values can be found listed in
    // Phong_Shader::update_GPU().
    const phong = new defs.Phong_Shader();
    const tex_phong = new defs.Textured_Phong();
    this.materials = {};
    this.materials.plastic = {
      shader: phong,
      ambient: .2,
      diffusivity: 1,
      specularity: .5,
      color: color(.9, .5, .9, 1)
    };
    this.materials.pure_color = {
      shader: phong,
      ambient: 1.0,
      diffusivity: 0,
      specularity: 0,
      color: color(.9, .5, .9, 1)
    };
    this.materials.metal = {
      shader: phong,
      ambient: .2,
      diffusivity: 1,
      specularity: 1,
      color: color(.9, .5, .9, 1)
    };
    this.materials.rgb = {
      shader: tex_phong,
      ambient: .5,
      texture: new Texture('assets/rgb.jpg')
    };
    this.time_step = 0.001;
    this.t_sim = 0.0;
    this.particles = [];
    this.particles.push(
        new Particle(1, 0, 0, 0, -1, 0, -1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1));
    this.canvas_particles = [];
    this.loaded_canvas = false;
  }
  render_animation(caller) {  // display():  Called once per frame of animation.
                              // We'll isolate out
    // the code that actually draws things into Part_one_hermite, a
    // subclass of this Scene.  Here, the base class's display only does
    // some initial setup.

    // Setup -- This part sets up the scene's overall camera matrix, projection
    // matrix, and lights:
    if (!caller.controls) {
      this.animated_children.push(
          caller.controls =
              new defs.Movement_Controls({uniforms: this.uniforms}));
      caller.controls.add_mouse_controls(caller.canvas);

      // Define the global camera and projection matrices, which are stored in
      // shared_uniforms.  The camera matrix follows the usual format for
      // transforms, but with opposite values (cameras exist as inverted
      // matrices).  The projection matrix follows an unusual format and
      // determines how depth is treated when projecting 3D points onto a plane.
      // The Mat4 functions perspective() or orthographic() automatically
      // generate valid matrices for one.  The input arguments of perspective()
      // are field of view, aspect ratio, and distances to the near plane and
      // far plane.

      // !!! Camera changed here
      Shader.assign_camera(
          Mat4.look_at(vec3(15, -1, 15), vec3(-6, -7, -6), vec3(0, 1, 0)),
          this.uniforms);
    }
    this.uniforms.projection_transform =
        Mat4.perspective(Math.PI / 4, caller.width / caller.height, 1, 100);
    const t = this.t = this.uniforms.animation_time / 1000;
    const angle = Math.sin(t);
    // *** Lights: *** Values of vector or point lights.  They'll be consulted
    // by the shader when coloring shapes.  See Light's class definition for
    // inputs. const light_position = Mat4.rotation( angle,   1,0,0 ).times(
    // vec4( 0,-1,1,0 ) ); !!!
    // !!! Light changed here


    // const light_position = vec4(20 * Math.cos(angle), 20,  20 *
    // Math.sin(angle), 1.0);
    const light_position = vec4(20, 20, 20, 1.0);
    this.uniforms.lights = [defs.Phong_Shader.light_source(
        light_position, color(1, 1, 1, 1), 1000000)];
  }
}


export class Project extends
    project_base {  // **Part_one_hermite** is a Scene object that can be added
                    // to any display canvas. This particular scene is broken up
                    // into two pieces for easier understanding. See the other
                    // piece, My_Demo_Base, if you need to see the setup code.
                    // The piece here exposes only the display() method, which
                    // actually places and draws the shapes.  We isolate that
                    // code so it can be experimented with on its own. This
                    // gives you a very small code sandbox for editing a simple
                    // scene, and for experimenting with matrix transformations.
  render_animation(caller) {  // display():  Called once per frame of animation.
                              // For each shape that you want to
    // appear onscreen, place a .draw() call for it inside.  Each time, pass in
    // a different matrix value to control where the shape appears.

    // Variables that are in scope for you to use:
    // this.shapes.box:   A vertex array object defining a 2x2x2 cube.
    // this.shapes.ball:  A vertex array object defining a 2x2x2 spherical
    // surface. this.materials.metal:    Selects a shader and draws with a shiny
    // surface. this.materials.plastic:  Selects a shader and draws a more matte
    // surface. this.lights:  A pre-made collection of Light objects.
    // this.hover:  A boolean variable that changes when the user presses a
    // button. shared_uniforms:  Information the shader needs for drawing.  Pass
    // to draw(). caller:  Wraps the WebGL rendering context shown onscreen.
    // Pass to draw().

    // Call the setup code that we left inside the base class:
    super.render_animation(caller);
    const white = color(1,1,1,1), blue = color(0,0,1,1);
    const t = this.t = this.uniforms.animation_time / 1000;

    let floor_transform = Mat4.translation(0, -10, 0).times(Mat4.scale(10, 0.01, 10)).times(Mat4.rotation(Math.PI/4,0,1,0));
    this.shapes.box.draw(caller, this.uniforms, floor_transform, { ...this.materials.plastic, color: white } );
    let lwall_transform = Mat4.translation(7,-4,-7).times(Mat4.scale(1,1,1)).times(Mat4.rotation(Math.PI/4,0,1,0)).times(Mat4.scale(.01,10,10));
    this.shapes.box.draw(caller, this.uniforms, lwall_transform, { ...this.materials.plastic, color: white } );
    let rwall_transform = Mat4.translation(-7,-4,7).times(Mat4.scale(1,1,1)).times(Mat4.rotation(Math.PI/4,0,1,0)).times(Mat4.scale(.01,10,10));
    this.shapes.box.draw(caller, this.uniforms, rwall_transform, { ...this.materials.plastic, color: white } );
    let bwall_transform = Mat4.translation(-7,-4,-7).times(Mat4.scale(1,1,1)).times(Mat4.rotation(Math.PI/4,0,1,0)).times(Mat4.scale(10,10,.01));
    this.shapes.box.draw(caller, this.uniforms, bwall_transform, { ...this.materials.plastic, color: white } );

    // box for particles

    let pb_left_transform = Mat4.translation(-1,-4,0).times(Mat4.scale(0.5, 5.5, 2));
    this.shapes.box.draw(caller, this.uniforms, pb_left_transform, { ...this.materials.plastic, color: blue } );
    let pb_bottom_transform = Mat4.translation(4.5,-10,0).times(Mat4.scale(6, 0.5, 2));
    this.shapes.box.draw(caller, this.uniforms, pb_bottom_transform, { ...this.materials.plastic, color: blue } );
    let pb_right_transform = Mat4.translation(10,-4,0).times(Mat4.scale(0.5, 5.5, 2));
    this.shapes.box.draw(caller, this.uniforms, pb_right_transform, { ...this.materials.plastic, color: blue } );
    let pb_top_transform = Mat4.translation(4.5,1,0).times(Mat4.scale(6, 0.5, 2));
    this.shapes.box.draw(caller, this.uniforms, pb_top_transform, { ...this.materials.plastic, color: blue } );
    let pb_back_transform = Mat4.translation(4.5,-4.5,-2).times(Mat4.scale(6, 6, 0.5));
    this.shapes.box.draw(caller, this.uniforms, pb_back_transform, { ...this.materials.plastic, color: blue } );
    // draw a particle for testing
    //this.particles[0].pos = vec3(1, 0, 1);
    //this.particles[0].vel = vec3(0, 50, 0);
    //this.particles[0].acc = vec3(1, 1, 1);
    //this.particles[0].valid = true;

    let dt = this.dt =
        Math.min(1 / 30, this.uniforms.animation_delta_time / 1000);
    const t_next = this.t_sim + dt;
    const readers = get_readers();
    if (this.loaded_canvas == false && readers.length >=1){

      const reader = readers[0];
      const width = reader.width;
      const height = reader.height;
      const x_offset = 0;
      const x_scale = .3;
      const y_scale = .3;
      const y_offset = 0;
      const z_offset = 0;
      const opacity = .5;
      const SCALE = 255;

      this.canvas_particles = new Array(width * height);

      for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
          // We need to create a transformation matrix for each matrix.
          console.log("i: "+i+" j: "+j);
          const rgb = reader.get_pixel(i,j);
          // Set the height to be negative so we build the value down.
          const x = x_offset + i*x_scale;
          const y = y_offset - j*y_scale;
          const z = z_offset;
          let curr_particle = new Particle();
          curr_particle.set_pos(x, y, z)
          curr_particle.set_color(color(rgb[0]/SCALE, rgb[1]/SCALE, rgb[2]/SCALE, opacity));
          this.canvas_particles[j * height + i] = curr_particle;
        }
      }
      this.loaded_canvas = true;
    }
      // Update each particle using integration technique.
      while (this.t_sim < t_next) {
        for (let i = 0; i < this.particles.length; i++) {
          this.particles[i].update(this.time_step);
        }
        for (let i = 0; i < Math.min(this.canvas_particles.length, 10000); i++){
          this.canvas_particles[i].update(this.time_step);
        }
        this.t_sim += this.time_step;
      }

      // Draw all the particles in the image
      for (let i = 0; i< this.particles.length; i++){
        const particle = this.particles[i];
        particle.draw(caller, this.uniforms, this.shapes, this.materials);
      }

      for (let i = 0; i< Math.min(this.canvas_particles.length, 10000); i++){
        const particle = this.canvas_particles[i];
        particle.draw(caller, this.uniforms, this.shapes, this.materials);
      }

    //this.particles[0].draw(caller, this.uniforms, this.shapes, this.materials);
  }

  // Render buttons, etc.
  render_controls() {
    // Create an HTML canvas that is invisible solely for reading RGB pixel
    // values.
    let canvas = document.createElement('canvas');
    canvas.setAttribute('style', 'display:none');
    canvas.setAttribute('id', 'canvasImg1');
    this.control_panel.appendChild(canvas);

    let image_upload = document.createElement('input');
    image_upload.setAttribute('type', 'file');
    image_upload.setAttribute('id', 'upload_image_1');
    this.control_panel.appendChild(image_upload);

    image_upload.addEventListener('change', save_to_canvas)
    let output = document.createElement('img');
    output.setAttribute('id', 'output');
    this.control_panel.appendChild(output);

    this.new_line();
    this.key_triggered_button( "Simulate", [], this.begin_sim );
  }

  begin_sim() {

  }
  // Save uploaded image to created canvas for parsing.
}
