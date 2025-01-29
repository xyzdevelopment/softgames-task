import gsap from 'gsap';
import * as PIXI from 'pixi.js';

export class AceOfShadowsScene extends PIXI.Container
{
    private cardStack: PIXI.Sprite[] = [];
    private originalStackPosition: PIXI.Point;
    private movedCards: PIXI.Sprite[] = [];
    private moveInterval: any = null; // Store the interval reference
    private static readonly MOVE_INTERVAL = 1000; // 1 second interval
    private static readonly MOVE_DURATION = 2; // 2 seconds animation
    private static readonly RESET_DELAY = 1000; // 1 second before reset

    constructor(app: PIXI.Application)
    {
        super();


        this.originalStackPosition = new PIXI.Point(630, 384);

        // Create 144 stacked cards with alternating colors
        for (let i = 0; i < 144; i++)
        {
            const texture = i % 2 === 0 ? 'assets/card-back-black.png' : 'assets/card-back-red.png';
            const card = PIXI.Sprite.from(texture);
            card.anchor.set(0.5);
            card.x = this.originalStackPosition.x;
            card.y = this.originalStackPosition.y + i * 1.5; // Adjusted to start from bottom
            this.addChild(card);
            this.cardStack.push(card); // Insert at the top so movement starts from bottom
        }

        this.startCardMovement();
    }

    private startCardMovement(): void
    {
        this.moveInterval = setInterval(() =>
        {
            if (this.cardStack.length > 0)
            {
                const bottomCard = this.cardStack.pop(); // Take from bottom (last element)
                if (bottomCard)
                {
                    const newX = 1100 + (Math.random() * 200 + 50); // Ensures X is always greater than 1100
                    const newY = this.originalStackPosition.y + (Math.random() * 40 - 20); // Small vertical variation
                    this.setChildIndex(bottomCard, this.children.length - 1); // Ensure it moves to the top layer

                    gsap.to(bottomCard, {
                        x: newX,
                        y: newY,
                        duration: AceOfShadowsScene.MOVE_DURATION,
                        onComplete: () =>
                        {
                            this.movedCards.unshift(bottomCard); // Push the card to the front of movedCards
                            if (this.cardStack.length === 0)
                            {
                                setTimeout(() => this.resetStack(), AceOfShadowsScene.RESET_DELAY);
                            }
                        },
                    });
                }
            }
        }, AceOfShadowsScene.MOVE_INTERVAL);
    }

    public stopCardMovement(): void
    {
        if (this.moveInterval)
        {
            clearInterval(this.moveInterval);
            this.moveInterval = null;
        }

        // Kill all ongoing GSAP animations for both moving and already moved cards
        gsap.killTweensOf(this.cardStack);
        gsap.killTweensOf(this.movedCards);


        console.log("Stopped all card movements and killed GSAP animations.");
    }

    private resetStack(): void
    {
        this.movedCards.reverse().forEach((card, index) =>
        {
            card.x = this.originalStackPosition.x;
            card.y = this.originalStackPosition.y + index * 1.5; // Adjusted to maintain a cleaner view from bottom
            this.cardStack.push(card); // Push back to stack maintaining order from bottom
        });
        this.movedCards = [];
    }
}
