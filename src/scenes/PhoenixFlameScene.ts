import { Emitter } from '@pixi/particle-emitter';
import * as PIXI from 'pixi.js';

export class PhoenixFlameScene extends PIXI.Container
{
    private emitter!: Emitter;
    private elapsed: number = Date.now();
    private ticker!: PIXI.Ticker;

    constructor()
    {
        super();
        this.initParticles();
    }

    private initParticles()
    {
        const textures = [
            PIXI.Assets.get('particle'),
            PIXI.Assets.get('fire')
        ];

        this.emitter = new Emitter(
            this,
            {
                lifetime: {
                    min: 0.1,
                    max: 0.75
                },
                frequency: 0.001,
                maxParticles: 10,
                particlesPerWave: 1,
                pos: {
                    x: 640,
                    y: 820
                },
                behaviors: [
                    {
                        type: 'alpha',
                        config: {
                            alpha: {
                                list: [
                                    { time: 0, value: 0.62 },
                                    { time: 1, value: 0 }
                                ]
                            }
                        }
                    },
                    {
                        type: 'moveSpeedStatic',
                        config: {
                            min: 400,
                            max: 400
                        }
                    },
                    {
                        type: 'scale',
                        config: {
                            scale: {
                                list: [
                                    { time: 0, value: 0.25 },
                                    { time: 1, value: 5 }
                                ]
                            },
                            minMult: 1
                        }
                    },
                    {
                        type: 'color',
                        config: {
                            color: {
                                list: [
                                    { time: 0, value: 'fff191' },
                                    { time: 1, value: 'ff622c' }
                                ]
                            }
                        }
                    },
                    {
                        type: 'rotation',
                        config: {
                            accel: 0,
                            minSpeed: 50,
                            maxSpeed: 50,
                            minStart: 265,
                            maxStart: 275
                        }
                    },
                    {
                        type: 'textureRandom',
                        config: {
                            textures: textures
                        }
                    },
                    {
                        type: 'spawnShape',
                        config: {
                            type: 'torus',
                            data: {
                                x: 0,
                                y: 0,
                                radius: 10,
                                innerRadius: 0,
                                affectRotation: false
                            }
                        }
                    }
                ]
            }
        );

        this.startAnimation();
    }

    private startAnimation()
    {
        this.emitter.emit = true;
        this.ticker = new PIXI.Ticker();
        this.ticker.add((delta) => this.updateEmitter(delta));
        this.ticker.start();
    }

    private updateEmitter(delta: number)
    {
        this.emitter.update(delta * 0.016);
    }
}