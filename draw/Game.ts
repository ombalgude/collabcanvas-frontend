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
  private clicked: boolean;
  private startX = 0;
  private startY = 0;
  private selectedTool: Tool = "circle";
  private socket: WebSocket;

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.roomId = roomId;
    this.socket = socket;
    this.clicked = false;
    this.ctx = canvas.getContext("2d")!;
    this.existingShapes = [];

    this.initMouseHandlers();
    this.initSocket(); 
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
  
  /**
   * --- CHANGE APPLIED HERE ---
   * Initializes the WebSocket listeners. It no longer sends any messages itself.
   */
  initSocket() {
    // Clear any old drawings for this room to ensure a clean start.
    localStorage.removeItem(`canvas-${this.roomId}`);
    this.existingShapes = [];
    this.clearCanvas();

    // This handler just listens for messages sent from the server.
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      // Handles new shapes drawn by others.
      if (message.type === "chat") {
        const parsedShape = JSON.parse(message.message);
        this.existingShapes.push(parsedShape.shape);
        this.clearCanvas();
        localStorage.setItem(`canvas-${this.roomId}`, JSON.stringify(this.existingShapes));
      }
      
      // Handles receiving the full canvas history.
      if (message.type === "canvas_history" && Array.isArray(message.shapes)) {
        this.existingShapes = message.shapes;
        this.clearCanvas();
        localStorage.setItem(`canvas-${this.roomId}`, JSON.stringify(this.existingShapes));
      }
    };
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(0,0,0,1)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeStyle = "rgba(255,255,255,1)";
    this.ctx.lineWidth = 2;

    this.existingShapes.forEach((shape) => {
      if (shape.type === "rect") {
        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        this.ctx.beginPath();
        this.ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
        this.ctx.stroke();
      } else if (shape.type === "pencil") {
        this.ctx.beginPath();
        this.ctx.moveTo(shape.startX, shape.startY);
        this.ctx.lineTo(shape.endX, shape.endY);
        this.ctx.stroke();
      }
    });
  }

  // --- MOUSE HANDLERS (No Changes Needed) ---
  mouseDownHandler = (e: MouseEvent) => {
    this.clicked = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
  };

  mouseUpHandler = (e: MouseEvent) => {
    this.clicked = false;
    if (this.selectedTool === "pencil") return;
    const width = e.clientX - this.startX;
    const height = e.clientY - this.startY;
    let shape: Shape | null = null;
    if (this.selectedTool === "rect") {
      shape = { type: "rect", x: this.startX, y: this.startY, width, height };
    } else if (this.selectedTool === "circle") {
      const radius = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)) / 2;
      shape = {
        type: "circle",
        centerX: this.startX + width / 2,
        centerY: this.startY + height / 2,
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
    if (this.selectedTool === "pencil") {
      const shape: Shape = {
        type: "pencil", startX: this.startX, startY: this.startY, endX: e.clientX, endY: e.clientY,
      };
      this.existingShapes.push(shape);
      localStorage.setItem(`canvas-${this.roomId}`, JSON.stringify(this.existingShapes));
      this.socket.send(
        JSON.stringify({
          type: "chat", message: JSON.stringify({ shape }), roomId: this.roomId,
        })
      );
      this.ctx.beginPath();
      this.ctx.moveTo(this.startX, this.startY);
      this.ctx.lineTo(e.clientX, e.clientY);
      this.ctx.stroke();
      this.startX = e.clientX;
      this.startY = e.clientY;
    } else {
      this.clearCanvas();
      const width = e.clientX - this.startX;
      const height = e.clientY - this.startY;
      if (this.selectedTool === "rect") {
        this.ctx.strokeRect(this.startX, this.startY, width, height);
      } else if (this.selectedTool === "circle") {
        const radius = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)) / 2;
        const centerX = this.startX + width / 2;
        const centerY = this.startY + height / 2;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.stroke();
      }
    }
  };

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }
}
