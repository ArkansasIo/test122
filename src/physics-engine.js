/**
 * Advanced Physics Engine
 * 2D physics simulation with rigid bodies, collisions, joints, and constraints
 */

class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(v) {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  subtract(v) {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  multiply(scalar) {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    const mag = this.magnitude();
    if (mag === 0) return new Vector2(0, 0);
    return new Vector2(this.x / mag, this.y / mag);
  }

  distance(v) {
    return this.subtract(v).magnitude();
  }

  clone() {
    return new Vector2(this.x, this.y);
  }
}

class RigidBody {
  constructor(x, y, width, height, mass = 1, type = 'dynamic') {
    this.id = Math.random().toString(36).substr(2, 9);
    this.type = type; // 'static', 'dynamic', 'kinematic'
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.mass = type === 'static' ? 0 : mass;
    this.velocity = new Vector2(0, 0);
    this.acceleration = new Vector2(0, 0);
    this.angularVelocity = 0;
    this.rotation = 0;
    this.friction = 0.3;
    this.restitution = 0.2; // bounce
    this.linearDamping = 0.1;
    this.angularDamping = 0.1;
    this.constraints = [];
  }

  applyForce(force) {
    if (this.mass > 0) {
      this.acceleration = this.acceleration.add(force.multiply(1 / this.mass));
    }
  }

  applyImpulse(impulse) {
    if (this.mass > 0) {
      this.velocity = this.velocity.add(impulse.multiply(1 / this.mass));
    }
  }

  update(deltaTime, gravity = 9.8) {
    if (this.type === 'static') return;

    // Apply gravity
    if (this.type === 'dynamic') {
      this.acceleration.y += gravity;
    }

    // Update velocity
    this.velocity = this.velocity.add(this.acceleration.multiply(deltaTime));
    
    // Apply damping
    this.velocity = this.velocity.multiply(1 - this.linearDamping);
    this.angularVelocity *= (1 - this.angularDamping);

    // Update position
    this.x += this.velocity.x * deltaTime;
    this.y += this.velocity.y * deltaTime;
    this.rotation += this.angularVelocity * deltaTime;

    // Reset acceleration
    this.acceleration = new Vector2(0, 0);
  }

  getBounds() {
    return {
      left: this.x,
      right: this.x + this.width,
      top: this.y,
      bottom: this.y + this.height
    };
  }

  getCenter() {
    return new Vector2(this.x + this.width / 2, this.y + this.height / 2);
  }

  serialize() {
    return {
      id: this.id,
      type: this.type,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      mass: this.mass,
      velocity: { x: this.velocity.x, y: this.velocity.y },
      rotation: this.rotation
    };
  }
}

class Collision {
  constructor(bodyA, bodyB, normal, depth) {
    this.bodyA = bodyA;
    this.bodyB = bodyB;
    this.normal = normal;
    this.depth = depth;
    this.contactPoint = null;
  }

  resolve() {
    // Don't resolve if both are static
    if (this.bodyA.type === 'static' && this.bodyB.type === 'static') return;

    // Calculate relative velocity
    const relVel = this.bodyB.velocity.subtract(this.bodyA.velocity);

    // Project onto normal
    const velAlongNormal = relVel.dot(this.normal);

    // Don't resolve if velocities are separating
    if (velAlongNormal > 0) return;

    // Calculate restitution (bounce)
    const e = Math.min(this.bodyA.restitution, this.bodyB.restitution);

    // Calculate impulse scalar
    let j = -(1 + e) * velAlongNormal;
    
    if (this.bodyA.type !== 'static' && this.bodyB.type !== 'static') {
      j /= (1 / this.bodyA.mass + 1 / this.bodyB.mass);
    } else if (this.bodyA.type !== 'static') {
      j /= 1 / this.bodyA.mass;
    } else {
      j /= 1 / this.bodyB.mass;
    }

    // Apply impulse
    const impulse = this.normal.multiply(j);
    if (this.bodyA.type !== 'static') {
      this.bodyA.velocity = this.bodyA.velocity.subtract(impulse.multiply(1 / this.bodyA.mass));
    }
    if (this.bodyB.type !== 'static') {
      this.bodyB.velocity = this.bodyB.velocity.add(impulse.multiply(1 / this.bodyB.mass));
    }

    // Separate bodies to prevent overlap
    const totalMass = (this.bodyA.mass || 1) + (this.bodyB.mass || 1);
    const separation = this.normal.multiply(this.depth / totalMass);
    
    if (this.bodyA.type !== 'static') {
      this.bodyA.x -= separation.x * (this.bodyA.mass || 1);
      this.bodyA.y -= separation.y * (this.bodyA.mass || 1);
    }
    if (this.bodyB.type !== 'static') {
      this.bodyB.x += separation.x * (this.bodyB.mass || 1);
      this.bodyB.y += separation.y * (this.bodyB.mass || 1);
    }
  }
}

class Joint {
  constructor(bodyA, bodyB, anchor, limitMin = 0, limitMax = 1) {
    this.bodyA = bodyA;
    this.bodyB = bodyB;
    this.anchor = anchor;
    this.limitMin = limitMin;
    this.limitMax = limitMax;
    this.type = 'distance'; // distance, revolute, prismatic
  }

  constrain() {
    const centerA = this.bodyA.getCenter();
    const centerB = this.bodyB.getCenter();
    const distance = centerA.distance(centerB);
    
    if (distance < 0.001) return;

    const direction = centerB.subtract(centerA).normalize();
    const currentDistance = distance;
    const targetDistance = this.limitMin + (this.limitMax - this.limitMin) * 0.5;
    
    const diff = (currentDistance - targetDistance) * 0.5;
    const offset = direction.multiply(diff);

    if (this.bodyA.type !== 'static' && this.bodyB.type !== 'static') {
      this.bodyA.x += offset.x;
      this.bodyA.y += offset.y;
      this.bodyB.x -= offset.x;
      this.bodyB.y -= offset.y;
    } else if (this.bodyA.type !== 'static') {
      this.bodyA.x += offset.x * 2;
      this.bodyA.y += offset.y * 2;
    } else if (this.bodyB.type !== 'static') {
      this.bodyB.x -= offset.x * 2;
      this.bodyB.y -= offset.y * 2;
    }
  }
}

class PhysicsWorld {
  constructor(width = 1280, height = 720, gravity = 9.8) {
    this.width = width;
    this.height = height;
    this.gravity = gravity;
    this.bodies = [];
    this.collisions = [];
    this.joints = [];
    this.timeStep = 1 / 60; // 60 FPS
    this.subSteps = 4;
    this.damping = 0.99;
  }

  addBody(body) {
    this.bodies.push(body);
    return body;
  }

  removeBody(bodyId) {
    this.bodies = this.bodies.filter(b => b.id !== bodyId);
  }

  getBody(bodyId) {
    return this.bodies.find(b => b.id === bodyId);
  }

  addJoint(joint) {
    this.joints.push(joint);
    return joint;
  }

  checkCollisions() {
    this.collisions = [];

    for (let i = 0; i < this.bodies.length; i++) {
      for (let j = i + 1; j < this.bodies.length; j++) {
        const collision = this.checkCollision(this.bodies[i], this.bodies[j]);
        if (collision) {
          this.collisions.push(collision);
        }
      }
    }
  }

  checkCollision(bodyA, bodyB) {
    const boundsA = bodyA.getBounds();
    const boundsB = bodyB.getBounds();

    const overlapX = Math.min(boundsA.right, boundsB.right) - Math.max(boundsA.left, boundsB.left);
    const overlapY = Math.min(boundsA.bottom, boundsB.bottom) - Math.max(boundsA.top, boundsB.top);

    if (overlapX > 0 && overlapY > 0) {
      let normal;
      let depth;

      if (overlapX < overlapY) {
        depth = overlapX;
        normal = boundsA.left < boundsB.left ? new Vector2(-1, 0) : new Vector2(1, 0);
      } else {
        depth = overlapY;
        normal = boundsA.top < boundsB.top ? new Vector2(0, -1) : new Vector2(0, 1);
      }

      return new Collision(bodyA, bodyB, normal, depth);
    }

    return null;
  }

  update(deltaTime = null) {
    const dt = deltaTime || this.timeStep;
    const subDt = dt / this.subSteps;

    for (let step = 0; step < this.subSteps; step++) {
      // Update bodies
      for (let body of this.bodies) {
        body.update(subDt, this.gravity);
      }

      // Check collisions and resolve
      this.checkCollisions();
      for (let collision of this.collisions) {
        collision.resolve();
      }

      // Constrain joints
      for (let joint of this.joints) {
        joint.constrain();
      }

      // Apply world damping
      for (let body of this.bodies) {
        body.velocity = body.velocity.multiply(this.damping);
      }
    }
  }

  raycast(x1, y1, x2, y2) {
    const results = [];
    const ray = new Vector2(x2 - x1, y2 - y1);
    const rayLength = ray.magnitude();

    for (let body of this.bodies) {
      const bounds = body.getBounds();
      // Simple AABB-ray intersection
      if (this.rayIntersectsAABB(x1, y1, x2, y2, bounds)) {
        results.push(body);
      }
    }

    return results;
  }

  rayIntersectsAABB(x1, y1, x2, y2, bounds) {
    const dx = x2 - x1;
    const dy = y2 - y1;

    let t = 0;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) {
        t = (bounds.left - x1) / dx;
      } else {
        t = (bounds.right - x1) / dx;
      }
    } else {
      if (dy > 0) {
        t = (bounds.top - y1) / dy;
      } else {
        t = (bounds.bottom - y1) / dy;
      }
    }

    return t >= 0 && t <= 1;
  }

  getBodyCount() {
    return this.bodies.length;
  }

  getCollisionCount() {
    return this.collisions.length;
  }

  serialize() {
    return {
      bodies: this.bodies.map(b => b.serialize()),
      collisionCount: this.collisions.length,
      jointCount: this.joints.length,
      gravity: this.gravity,
      version: '1.0'
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Vector2, RigidBody, Collision, Joint, PhysicsWorld };
}
