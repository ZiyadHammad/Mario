// Fn big() - to double the size of mario for a period of time after mushroom consumption.
// & return to regular size once timer is <= 0
const JUMP = 400;
const BIG_JUMP = 500;
let CURRENT_JUMP = JUMP;

function big() {
  let timer = 0;
  let isBig = false;
  return {
    update() {
      if (isBig) {
        CURRENT_JUMP = BIG_JUMP;
        timer -= dt();
        if (timer <= 0) {
          this.smallify();
        }
      }
    },
    isBig() {
      return isBig;
    },
    smallify() {
      this.scale = vec2(1);
      CURRENT_JUMP = JUMP;
      timer = 0;
      isBig = false;
    },
    biggify(time) {
      this.scale = vec2(2);
      timer = time;
      isBig = true;
    },
  };
}

export {big}