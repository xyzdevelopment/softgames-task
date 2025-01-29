import * as PIXI from 'pixi.js';
import { AceOfShadowsScene } from '../scenes/AceOfShadowsScene';
import { MagicWordsScene } from '../scenes/MagicWordsScene';
import { PhoenixFlameScene } from '../scenes/PhoenixFlameScene';
import { SceneManager } from './SceneManager';

class Main
{
    private app: PIXI.Application;
    private sceneManager: SceneManager;
    private fpsText!: PIXI.Text;
    private lastFrameTime: number = performance.now();
    private frameCount: number = 0;
    private currentScene!: PIXI.Container;

    constructor()
    {
        this.app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x1099bb,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });

        (globalThis as any).__PIXI_APP__ = this.app;
        document.body.appendChild(this.app.view as HTMLCanvasElement);

        this.sceneManager = new SceneManager(this.app);
        this.createButtons();
        this.setupFPSCounter();
        window.addEventListener('resize', () => this.onResize());
        this.onResize();
    }

    private createButtons(): void
    {
        const scenes = [
            { name: 'AceOfShadows', scene: AceOfShadowsScene },
            { name: 'MagicWords', scene: MagicWordsScene },
            { name: 'PhoenixFlame', scene: PhoenixFlameScene }
        ];

        scenes.forEach((sceneData, index) =>
        {
            const button = new PIXI.Text(sceneData.name, {
                fontFamily: 'Arial',
                fontSize: 20,
                fill: 0xffffff,
            });
            button.interactive = true;
            button.x = 20;
            button.y = 40 + index * 40;
            button.on('pointerdown', () => this.switchScene(sceneData.scene));
            this.app.stage.addChild(button);
        });
    }

    private switchScene(SceneClass: any): void
    {
        if (this.currentScene)
        {
            if (this.currentScene instanceof AceOfShadowsScene)
            {
                this.currentScene.stopCardMovement(); // Stop active intervals
            }
            this.app.stage.removeChild(this.currentScene);
            this.currentScene.destroy({ children: true });
        }

        this.currentScene = new SceneClass();
        this.sceneManager.addScene(SceneClass.name, this.currentScene);
        this.sceneManager.switchScene(SceneClass.name);
        this.app.stage.addChild(this.currentScene);
        this.onResize();
    }

    private setupFPSCounter(): void
    {
        this.fpsText = new PIXI.Text('FPS: 0', {
            fontFamily: 'Arial',
            fontSize: 16,
            fill: 0xffffff,
            align: 'left',
        });

        this.fpsText.position.set(10, 10);
        this.app.stage.addChild(this.fpsText);

        this.updateFPS();
    }

    private updateFPS(): void
    {
        this.frameCount++;
        const now = performance.now();
        if (now - this.lastFrameTime >= 1000)
        {
            const fps = this.frameCount;
            this.fpsText.text = `FPS: ${fps}`;
            this.frameCount = 0;
            this.lastFrameTime = now;
        }
        requestAnimationFrame(() => this.updateFPS());
    }

    private onResize(): void
    {
        console.log("RESIZE EVENT DETECTED");

        const width = window.innerWidth;
        const height = window.innerHeight;

        this.app.renderer.resize(width, height);

        if (this.currentScene)
        {
            console.log("UPDATING SCENE SCALE & POSITION");

            // Keep a fixed base resolution (standard landscape size)
            const baseWidth = 1920;
            const baseHeight = 1080;

            // Compute the best scaling factor (maintains aspect ratio)
            const scaleFactor = Math.min(width / baseWidth, height / baseHeight, 1);

            // Apply scaling to maintain aspect ratio
            this.currentScene.scale.set(scaleFactor, scaleFactor);

            // Center the scene correctly
            this.currentScene.position.set(
                (width - baseWidth * scaleFactor) / 2,
                (height - baseHeight * scaleFactor) / 2
            );

            console.log(`New Scale: ${scaleFactor}, Position: (${this.currentScene.position.x}, ${this.currentScene.position.y})`);
        }
    }


}

new Main();
