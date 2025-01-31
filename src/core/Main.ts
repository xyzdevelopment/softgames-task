import * as PIXI from 'pixi.js';
import { AceOfShadowsScene } from '../scenes/AceOfShadowsScene';
import { MagicWordsScene } from '../scenes/MagicWordsScene';
import { PhoenixFlameScene } from '../scenes/PhoenixFlameScene';
import { SceneManager } from './SceneManager';

class Main
{
    private app: PIXI.Application;
    private sceneManager!: SceneManager;
    private loadingContainer!: PIXI.Container;
    private progressBar!: PIXI.Graphics;
    private fpsText!: PIXI.Text;
    private currentScene!: PIXI.Container;
    private assetsLoaded: boolean = false;
    private lastFrameTime: number = performance.now();
    private frameCount: number = 0;

    constructor()
    {
        this.app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x000000,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });

        document.body.appendChild(this.app.view as HTMLCanvasElement);
        this.createLoadingScreen();
        this.loadAssets();
    }

    private createLoadingScreen(): void
    {
        this.loadingContainer = new PIXI.Container();

        // Loading text
        const loadingText = new PIXI.Text('Loading...', {
            fontFamily: 'Arial',
            fontSize: 32,
            fill: 0xffffff
        });
        loadingText.anchor.set(0.5);
        loadingText.position.set(this.app.screen.width / 2, this.app.screen.height / 2 - 50);

        // Progress bar container
        const barWidth = 300;
        const barHeight = 20;
        const barPadding = 4;

        // Background
        const barBackground = new PIXI.Graphics()
            .beginFill(0x444444)
            .drawRect(0, 0, barWidth + barPadding * 2, barHeight + barPadding * 2);
        barBackground.position.set(
            this.app.screen.width / 2 - barWidth / 2 - barPadding,
            this.app.screen.height / 2 - barHeight / 2
        );

        // Progress bar
        this.progressBar = new PIXI.Graphics()
            .beginFill(0x00ff00)
            .drawRect(0, 0, barWidth, barHeight);
        this.progressBar.position.set(
            this.app.screen.width / 2 - barWidth / 2,
            this.app.screen.height / 2 - barHeight / 2 + barPadding
        );

        this.loadingContainer.addChild(barBackground, this.progressBar, loadingText);
        this.app.stage.addChild(this.loadingContainer);
    }

    private async loadAssets(): Promise<void>
    {
        try
        {
            // Definisci i bundle di assets
            PIXI.Assets.addBundle('main', {
                'card-back-black': 'assets/card-back-black.png',
                'card-back-red': 'assets/card-back-red.png',
                'fire': 'assets/Fire.png',
                'particle': 'assets/particle.png'
            });

            // Carica gli assets con progresso
            await PIXI.Assets.loadBundle('main', (progress) =>
                this.updateProgress(progress)
            );

            this.onAssetsLoaded();
        } catch (error)
        {
            console.error('Failed to load assets:', error);
        }
    }

    private updateProgress(progress: number): void
    {
        if (!this.progressBar.destroyed)
        {
            this.progressBar.width = (300 * progress) / 100;
        }
    }

    private onAssetsLoaded(): void
    {
        this.assetsLoaded = true;
        this.app.stage.removeChild(this.loadingContainer);
        this.loadingContainer.destroy({ children: true });

        this.initializeGame();
    }

    private initializeGame(): void
    {
        this.sceneManager = new SceneManager(this.app);
        this.createButtons();
        this.setupFPSCounter();
        this.setupEventListeners();
        this.onResize();
    }

    private createButtons(): void
    {
        const scenes = [
            { name: 'Ace of Shadows', scene: AceOfShadowsScene },
            { name: 'Magic Words', scene: MagicWordsScene },
            { name: 'Phoenix Flame', scene: PhoenixFlameScene }
        ];

        scenes.forEach((sceneData, index) =>
        {
            const button = new PIXI.Text(sceneData.name, {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0xffffff,
                padding: 10
            });

            button.interactive = true;
            button.position.set(20, 80 + index * 60);

            button.on('pointerover', () => button.style.fill = 0xff0000)
                .on('pointerout', () => button.style.fill = 0xffffff)
                .on('pointerdown', () => this.switchScene(sceneData.scene));

            this.app.stage.addChild(button);
        });
    }

    private switchScene(SceneClass: any): void
    {
        if (!this.assetsLoaded) return;

        if (this.currentScene)
        {
            if (this.currentScene instanceof AceOfShadowsScene)
            {
                this.currentScene.stopCardMovement();
            }
            this.app.stage.removeChild(this.currentScene);
            this.currentScene.destroy({ children: true });
        }

        const cardTexture = PIXI.Texture.from('card-back-black');
        this.currentScene = new SceneClass(cardTexture);

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
            fill: 0x00ff00
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
            this.fpsText.text = `FPS: ${this.frameCount}`;
            this.frameCount = 0;
            this.lastFrameTime = now;
        }
        requestAnimationFrame(() => this.updateFPS());
    }

    private setupEventListeners(): void
    {
        window.addEventListener('resize', () => this.onResize());
    }

    private onResize(): void
    {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.app.renderer.resize(width, height);

        if (!this.currentScene) return;

        // Base dimensions (16:9 aspect ratio)
        const baseWidth = 1920;
        const baseHeight = 1080;
        const targetAspect = baseWidth / baseHeight;
        const currentAspect = width / height;

        let scaleFactor: number;
        let offsetX = 0;
        let offsetY = 0;

        if (currentAspect > targetAspect)
        {
            // Wider screen (landscape)
            scaleFactor = height / baseHeight;
            offsetX = (width - baseWidth * scaleFactor) / 2;
        } else
        {
            // Taller screen (portrait)
            scaleFactor = width / baseWidth;
            offsetY = (height - baseHeight * scaleFactor) / 2;
        }

        this.currentScene.scale.set(scaleFactor);
        this.currentScene.position.set(offsetX, offsetY);

        const canvas = this.app.view as HTMLCanvasElement;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
    }

}

new Main();