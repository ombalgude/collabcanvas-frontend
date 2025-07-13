import { getExistingShapes } from "./http";
import { Tool } from "@/app/components/Canvas";

type Shape =
  | { type: "rect"; x: number; y: number; width: number; height: number }
  | { type: "circle"; centerX: number; centerY: number; radius: number }
  | { type: "pencil"; startX: number; startY: number; endX: number; endY: number };

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[] = [];
  private roomId: string;
  private clicked = false;
  private startX = 0;
  private startY = 0;
  private selectedTool: Tool = "circle";
  private socket: WebSocket;

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.roomId = roomId;
    this.socket = socket;
    this.ctx = canvas.getContext("2d")!;

    this.init();
    this.initHandlers();
    this.initMouseHandlers();
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    this.socket.onmessage = null;
  }

  setTool(tool: Tool) {
    this.selectedTool = tool;
  }

  async init() {
    const local = localStorage.getItem(`canvas-${this.roomId}`);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) this.existingShapes = parsed;
      } catch {
        console.warn("Invalid canvas data in localStorage.");
      }
    } else {
      this.existingShapes = await getExistingShapes(this.roomId);
    }

    this.clearCanvas();

    // Identify this socket to others 
    this.socket.send(
      JSON.stringify({
        type: "join_room",
        roomId: this.roomId,
      })
    );
  }

  initHandlers() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      // Handle new shape from others
      if (message.type === "chat") {
        const parsedShape = JSON.parse(message.message);
        this.existingShapes.push(parsedShape.shape);
        localStorage.setItem(`canvas-${this.roomId}`, JSON.stringify(this.existingShapes));
        this.clearCanvas();
      }

      // A new user joined and send  the canvas
      if (message.type === "user-joined") {
        this.socket.send(
          JSON.stringify({
            type: "canvas-sync",
            to: message.newUserSocketId,
            shapes: this.existingShapes,
          })
        );
      }

      // new user receive the canvas
      if (message.type === "canvas-sync" && Array.isArray(message.shapes)) {
        this.existingShapes = message.shapes;
        localStorage.setItem(`canvas-${this.roomId}`, JSON.stringify(this.existingShapes));
        this.clearCanvas();
      }
    };
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(0,0,0,1)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.strokeStyle = "rgba(255,255,255,1)";
    this.existingShapes.forEach((shape) => {
      if (shape.type === "rect") {
        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        this.ctx.beginPath();
        this.ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (shape.type === "pencil") {
        this.ctx.beginPath();
        this.ctx.moveTo(shape.startX, shape.startY);
        this.ctx.lineTo(shape.endX, shape.endY);
        this.ctx.stroke();
        this.ctx.closePath();
      }
    });
  }

  mouseDownHandler = (e: MouseEvent) => {
    this.clicked = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
  };

  mouseUpHandler = (e: MouseEvent) => {
    this.clicked = false;

    const width = e.clientX - this.startX;
    const height = e.clientY - this.startY;
    let shape: Shape | null = null;

    if (this.selectedTool === "rect") {
      shape = {
        type: "rect",
        x: this.startX,
        y: this.startY,
        width,
        height,
      };
    } else if (this.selectedTool === "circle") {
      const radius = Math.max(width, height) / 2;
      shape = {
        type: "circle",
        centerX: this.startX + radius,
        centerY: this.startY + radius,
        radius,
      };
    }

    if (!shape) return;

    this.existingShapes.push(shape);
    localStorage.setItem(`canvas-${this.roomId}`, JSON.stringify(this.existingShapes));

    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ shape }),
        roomId: this.roomId,
      })
    );

    this.clearCanvas();
  };

  mouseMoveHandler = (e: MouseEvent) => {
    if (!this.clicked) return;

    const endX = e.clientX;
    const endY = e.clientY;

    if (this.selectedTool === "pencil") {
      const shape: Shape = {
        type: "pencil",
        startX: this.startX,
        startY: this.startY,
        endX,
        endY,
      };

      this.existingShapes.push(shape);
      localStorage.setItem(`canvas-${this.roomId}`, JSON.stringify(this.existingShapes));

      this.socket.send(
        JSON.stringify({
          type: "chat",
          message: JSON.stringify({ shape }),
          roomId: this.roomId,
        })
      );

      this.ctx.beginPath();
      this.ctx.moveTo(this.startX, this.startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
      this.ctx.closePath();

      this.startX = endX;
      this.startY = endY;
    }
  };

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }
}
