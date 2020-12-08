const canvas = document.getElementById("draw");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");

let colors = [
  {
    r: 223,
    g: 69,
    b: 133,
  },
  {
    r: 248,
    g: 131,
    b: 173,
  },
  {
    r: 255,
    g: 135,
    b: 104,
  },
  {
    r: 200,
    g: 32,
    b: 79,
  },
  {
    r: 250,
    g: 112,
    b: 138,
  },
];
function getColor(index, alpha) {
  const c = colors[index];
  return `rgba(${c.r},${c.g},${c.b},${alpha})`;
}

let isDrawing = false;
let recs = [];
let xStart;
let yStart;
let xEnd;
let yEnd;
let width;
let height;

window.addEventListener("mousedown", (e) => {
  width = 0;
  height = 0;
  xStart = e.clientX;
  yStart = e.clientY;
  isDrawing = true;
});
window.addEventListener("mousemove", setRec);
window.addEventListener("mouseup", (rec) => {
  isDrawing = false;
  recs.push(new Rec(Math.min(xStart, xEnd), Math.min(yStart, yEnd), width, height));
});
function setRec(e) {
  if (isDrawing === true) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    xEnd = e.clientX;
    yEnd = e.clientY;
    width = Math.max(xStart, xEnd) - Math.min(xStart, xEnd);
    height = Math.max(yStart, yEnd) - Math.min(yStart, yEnd);
  }
}
function ChildRec(xStart, yStart, width, height, color, movingDir) {
  this.degree = 0;
  this.x = xStart;
  this.y = yStart;
  this.xStart = xStart;
  this.yStart = yStart;
  this.width = width;
  this.height = height;
  this.color = color;
  this.timer = new Timer(1000);
  this.timer.start();
  this.d = 120;
  this.movingDir = movingDir;
  this.moveRotate = "move";
}
ChildRec.prototype.update = function (index) {
  ctx.fillStyle = this.color;
  let delta = Math.pow(this.timer.getValue(), 3) * this.d;
  if (this.movingDir === "hori") {
    if (index % 2 === 0) {
      this.x = this.xStart - delta;
    } else {
      this.x = this.xStart + delta;
    }
  } else {
    if (index % 2 === 0) {
      this.y = this.yStart - delta;
    } else {
      this.y = this.yStart + delta;
    }
  }
  ctx.fillRect(this.x, this.y, this.width, this.height);
};

ChildRec.prototype.rotateRec = function () {
  ctx.save();
  ctx.fillStyle = this.color;
  ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
  ctx.rotate((this.degree * Math.PI) / 180);
  ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
  ctx.restore();

  this.degree = this.degree + (180 - this.degree) * 0.1;

  // if (this.degree === 180) {
  // 	this.degree === 180
  // } else {
  // 	this.degree+=3;
  // }
};
ChildRec.prototype.checkTimerEnded = function () {
  if (this.timer.state === 2) {
    this.timer.reset();
    return true;
  }
  return false;
};
function Rec(xStart, yStart, width, height) {
  this.xStart = xStart;
  this.yStart = yStart;
  this.width = width;
  this.height = height;
  this.alpha = 0;
  this.colorIndex = Math.floor(Math.random() * colors.length);
  // this.color = getColor(this.colorIndex, this.alpha)
  this.state = 0;
  this.childRecs = [];
  this.split = true;
  this.splitTimes = 7;
  this.fadeInTimer = new Timer(1000);
  this.fadeInTimer.start();
}
Rec.prototype.createChildRec = function (xStart, yStart, width, height) {
  let w = width;
  let h = height;
  let movingDir = "hori";
  w > h ? (movingDir = "hori") : (movingDir = "verti");
  w > h ? (w = width / 2) : (h = height / 2);
  this.childRecs.push(new ChildRec(xStart, yStart, w, h, getColor(this.colorIndex, 1), movingDir));
  this.childRecs.push(
    new ChildRec(xStart + width - w, yStart + height - h, w, h, getColor(this.colorIndex, 1), movingDir)
  );
};
Rec.prototype.update = function () {
  if (this.state === 0) {
    this.alpha = this.fadeInTimer.getValue(); //怎麼只改alpha
    ctx.fillStyle = getColor(this.colorIndex, this.alpha);
    ctx.fillRect(this.xStart, this.yStart, this.width, this.height);
    if (this.fadeInTimer.getValue() === 1) {
      this.createChildRec(this.xStart, this.yStart, this.width, this.height);
      this.state = 1;
    }
  } else if (this.state === 2) {
    let random = Math.floor(Math.random() * 2);
    const grabChild1 = this.childRecs[this.childRecs.length - 1 - random];
    grabChild1.color = "rgba(255, 255, 255, 0)";
    const grabChild2 = this.childRecs[this.childRecs.length - 1 - (1 - random)];
    grabChild2.moveRotate = "rotate";
    this.createChildRec(grabChild1.x, grabChild1.y, grabChild1.width, grabChild1.height);
    this.state = 1;
  } else if (this.state === 3) {
    this.childRecs[this.childRecs.length - 1].d = -this.childRecs[this.childRecs.length - 1].d;
    this.childRecs[this.childRecs.length - 2].d = -this.childRecs[this.childRecs.length - 2].d;
    this.childRecs[this.childRecs.length - 1].xStart = this.childRecs[this.childRecs.length - 1].x;
    this.childRecs[this.childRecs.length - 1].yStart = this.childRecs[this.childRecs.length - 1].y;
    this.childRecs[this.childRecs.length - 2].xStart = this.childRecs[this.childRecs.length - 2].x;
    this.childRecs[this.childRecs.length - 2].yStart = this.childRecs[this.childRecs.length - 2].y;
    this.childRecs[this.childRecs.length - 1].timer.start();
    this.childRecs[this.childRecs.length - 2].timer.start();
    this.state = 6;
    this.split = false;
    this.childRecs.forEach((childrec) => {
      childrec.moveRotate = "move"; //確保每個childrec回去都有走update迴圈 否則會停在原地
    });
  } else if (this.state === 5) {
    if (this.childRecs.length === 2 && this.childRecs[0].timer.getValue() === 1) {
      this.fadeInTimer.reset();
      this.fadeInTimer.start();
      this.state = 7;
      //這裡就消失了 進到state7又重新顯示遞減所以才會閃一下
      //解法是讓這個階段跑完 不splice掉array維持childrec[0] childrec[1]的顯示
      //直到進state7的無限loop 畫面已由ctx.fillStyle/ctx.fillRect製造 再刪掉childrec[0] childrec[1]結束childrec[0] childrec[1]的動畫
    }

    if (this.childRecs.length > 2) {
      this.childRecs.splice(this.childRecs.length - 2, 2);
      const recoverChild = this.childRecs[this.childRecs.length - 1];
      const recoverChild2 = this.childRecs[this.childRecs.length - 2];
      recoverChild.color = getColor(this.colorIndex, 1);
      recoverChild2.color = getColor(this.colorIndex, 1);
      this.state = 3;
    }
  } else if (this.state === 7) {
    this.childRecs.splice(this.childRecs.length - 2, 2);
    this.alpha = 1 - this.fadeInTimer.getValue();
    ctx.fillStyle = getColor(this.colorIndex, this.alpha);
    ctx.fillRect(this.xStart, this.yStart, this.width, this.height);
  }
  this.childRecs.forEach((childrec, index) => {
    if (childrec.moveRotate === "move") {
      childrec.update(index);
    } else if (childrec.moveRotate === "rotate") {
      childrec.rotateRec();
    }
    //drawdashline
    if (index % 2 === 1) {
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = getColor(this.colorIndex, this.alpha);
      ctx.moveTo(
        this.childRecs[index - 1].x + this.childRecs[index - 1].width / 2,
        this.childRecs[index - 1].y + this.childRecs[index - 1].height / 2
      );
      ctx.lineTo(childrec.x + childrec.width / 2, childrec.y + childrec.height / 2);
      ctx.stroke();
    }
    //
    if (index === this.childRecs.length - 1) {
      if (childrec.checkTimerEnded()) {
        if (this.childRecs.length < 2 * this.splitTimes && this.split === true) {
          this.state = 2;
        } else {
          if (this.childRecs[this.childRecs.length - 1].d > 0) {
            this.state = 3;
          } else this.state = 5;
        }
      }
    }
  });
};
function Timer(limit) {
  this.state = 0; //  0代表還沒開始 1代表正在計時 2代表時間到了
  this.limit = limit; //   碼表設定的時間
  this.value = 0; //此刻的比例
  this.startTime; //開始計時那一刻的時間
  // this.pow = 0.5
}
Timer.prototype.reset = function () {
  this.state = 0;
  this.value = 1;
};
Timer.prototype.getValue = function () {
  if (this.state !== 1) {
    return this.value;
  }
  this.value = (Date.now() - this.startTime) / this.limit;
  if (this.value > 1) {
    this.value = 1;
    this.state = 2;
  }
  return this.value;
};
Timer.prototype.start = function () {
  this.startTime = Date.now();
  this.value = 0;
  this.state = 1;
};
function animate() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  ctx.fillStyle = "#FBF5E5";
  ctx.fillRect(0, 0, innerWidth, innerHeight);
  if (isDrawing) {
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.strokeRect(Math.min(xStart, xEnd), Math.min(yStart, yEnd), width, height);
  }
  recs.forEach((rec) => rec.update());
  requestAnimationFrame(animate);
}
animate();
