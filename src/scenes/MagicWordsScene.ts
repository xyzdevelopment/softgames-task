import gsap from 'gsap';
import * as PIXI from 'pixi.js';

export class MagicWordsScene extends PIXI.Container
{
    private characters: Record<string, PIXI.Sprite> = {};
    private dialogue: any[] = [];
    private textDisplays: Record<string, PIXI.Text> = {};
    private currentDialogueIndex: number = 0;

    constructor()
    {
        super();
        this.loadData();
    }

    private async loadData()
    {
        const response = await fetch('https://private-624120-softgamesassignment.apiary-mock.com/magicwords');
        const data = await response.json();
        this.dialogue = data.dialogue;
        this.createCharacters(data.characters);
        this.startDialogueLoop();
    }
    private createCharacters(characters: any[])
    {
        characters.forEach(character =>
        {
            const sprite = PIXI.Sprite.from(character.avatar);
            sprite.anchor.set(0.5);
            sprite.alpha = 0; // Start with characters hidden

            if (character.name === 'Sheldon')
            {
                sprite.x = 246;
                sprite.y = 534;
            } else if (character.name === 'Penny')
            {
                sprite.x = 856;
                sprite.y = 534;
            } else if (character.name === 'Leonard')
            {
                sprite.x = 586;
                sprite.y = 304;
            }

            sprite.name = character.name; // Assign a name for inspector visibility
            this.addChild(sprite);
            this.characters[character.name] = sprite;

            const textDisplay = new PIXI.Text('', {
                fontFamily: 'Arial',
                fontSize: 20,
                fill: 0xffffff,
                wordWrap: true,
                wordWrapWidth: 400,
            });
            textDisplay.anchor.set(0.5);
            textDisplay.x = sprite.x;
            textDisplay.y = sprite.y - 100; // Position above the character
            this.addChild(textDisplay);
            this.textDisplays[character.name] = textDisplay;
        });
    }

    private startDialogueLoop()
    {
        // Fade in characters at the beginning
        Object.values(this.characters).forEach(character =>
        {
            gsap.to(character, { alpha: 1, duration: 1 });
        });

        this.currentDialogueIndex = 0;
        this.showNextDialogue();
    }

    private showNextDialogue()
    {
        if (this.currentDialogueIndex >= this.dialogue.length)
        {
            setTimeout(() =>
            {
                // Fade out characters before restarting
                gsap.to(Object.values(this.characters), {
                    alpha: 0, duration: 1, onComplete: () =>
                    {
                        this.clearTextDisplays();
                        this.startDialogueLoop();
                    }
                });
            }, 5000);
            return;
        }

        this.clearTextDisplays();
        const currentDialogue = this.dialogue[this.currentDialogueIndex];

        const characterSprite = this.characters[currentDialogue.name];
        const textDisplay = this.textDisplays[currentDialogue.name];

        if (characterSprite && textDisplay)
        {
            gsap.to(characterSprite, { alpha: 1, duration: 0.5 });
            this.typeText(currentDialogue.text, textDisplay, () =>
            {
                this.currentDialogueIndex++;
                if (this.currentDialogueIndex < this.dialogue.length)
                {
                    setTimeout(() => this.showNextDialogue(), 1000);
                } else
                {
                    setTimeout(() =>
                    {
                        this.currentDialogueIndex = 0;
                        this.clearTextDisplays();
                        this.showNextDialogue();
                    }, 5000);
                }
            });
        } else
        {
            this.currentDialogueIndex++;
            setTimeout(() => this.showNextDialogue(), 1000);
        }
    }

    private typeText(text: string, textDisplay: PIXI.Text, onComplete: () => void)
    {
        let i = 0;
        const interval = setInterval(() =>
        {
            if (i < text.length)
            {
                textDisplay.text += text[i];
                i++;
            } else
            {
                clearInterval(interval);
                setTimeout(onComplete, 500);
            }
        }, 50);
    }

    private clearTextDisplays(): void
    {
        Object.values(this.textDisplays).forEach(textDisplay => textDisplay.text = '');
    }
}