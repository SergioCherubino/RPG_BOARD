// monster.js

export const Monsters = {
  goblin: {
    sprite: "goblin.png",
    movementRange: 2, 
    attributes: {
      hp: 6,
      armor: 8,
      damageMin: 1,
      damageMax: 3
    }
  },

  orc: {
    sprite: "orc.png",
    movementRange: 3,
    attributes: {
      hp: 12,
      armor: 12,
      damageMin: 2,
      damageMax: 5
    }
  },

  troll: {
    sprite: "troll.png",
    movementRange: 2, // lento
    attributes: {
      hp: 20,
      armor: 14,
      damageMin: 3,
      damageMax: 8
    }
  }
};


// Criar instância de monstro
export function createMonster(type) {
  const data = Monsters[type];
  if (!data) throw new Error("Monstro não encontrado: " + type);

  return {
    type,
    sprite: data.sprite,
    movementRange: data.movementRange,

    hp: data.attributes.hp,
    armor: data.attributes.armor,
    damageMin: data.attributes.damageMin,
    damageMax: data.attributes.damageMax,

    getDamage() {
      return Math.floor(
        Math.random() * (this.damageMax - this.damageMin + 1)
      ) + this.damageMin;
    }
  };
}
