import * as PIXI from 'pixi.js';

export class SceneManager
{
    private app: PIXI.Application;
    private scenes: { [key: string]: PIXI.Container } = {};
    private currentScene?: PIXI.Container;

    constructor(app: PIXI.Application)
    {
        this.app = app;
    }

    addScene(name: string, scene: PIXI.Container)
    {
        this.scenes[name] = scene;
    }

    switchScene(name: string)
    {
        if (this.currentScene)
        {
            this.app.stage.removeChild(this.currentScene);
        }
        this.currentScene = this.scenes[name];
        if (this.currentScene)
        {
            this.app.stage.addChild(this.currentScene);
        }
    }
}