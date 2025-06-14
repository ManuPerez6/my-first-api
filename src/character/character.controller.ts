import { Request, Response } from 'express';
import { Character } from './character.entity.js';
import { CharacterMongoRepository } from './character.mongodb.repository.js';
import { CharacterPostgresRepository } from './character.postgres.repository.js';


//const characterRepository = new CharacterMongoRepository();
const characterRepository = new CharacterPostgresRepository();

export class CharacterController {

    async findAllCharacters(req: Request, res: Response) {
        const characters = await characterRepository.findAll();
        res.json(characters);
    }

    async findCharacterById(req: Request, res: Response) {
        const characterId = req.params.id;
        const character = await characterRepository.findOne(characterId);
        if (!character) {
            res.status(404).json({
                errorMessage: 'Character not found',
                errorCode: 'CHARACTER_NOT_FOUND'
            });
            return;
        }
        res.json({ data: character });
    }

    async addCharacter(req: Request, res: Response) {

        const input = req.body;
        const newCharacter = new Character(
            input.name,
            input.characterClass,
            input.level,
            input.hp,
            input.mana,
            input.attack,
            input.items
        );

        await characterRepository.add(newCharacter);

        res.status(201).json({ data: newCharacter });

    }

    async updateCharacter(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const characterData = req.body.sanitizedInput;

            if (!characterData) {
                res.status(400).json({ error: 'Invalid input' });
                return;
            }

            const updated = await characterRepository.update(id, characterData);

            if (!updated) {
                res.status(404).json({ error: 'Character not found or update failed' });
                return;
            }

            res.status(200).json(updated);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    }

    async partialUpdateCharacter(req: Request, res: Response): Promise<void> {
      try {
        const id = req.params.id;
        const updates = req.body.sanitizedInput;

        if (!updates || Object.keys(updates).length === 0) {
          res.status(400).json({ error: 'No update data provided' });
          return;
        }

        const updated = await characterRepository.partialUpdate(id, updates);

        if (!updated) {
          res.status(404).json({ error: 'Character not found or update failed' });
          return;
        }

        res.status(200).json(updated);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
      }
    }

    async deleteCharacter(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;

            const deleted = await characterRepository.delete(id);

            if (!deleted) {
                res.status(404).json({ error: 'Character not found' });
                return;
            }

            res.status(200).json({ message: 'Character deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    }
}
