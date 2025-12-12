// player.js

export const PlayerClasses = {
  warrior: {
    sprite: "warrior.png",
    movementRange: 3,
    attributes: {
      hp: 20,
      armor: 16,
      damageMin: 3,
      damageMax: 6
    }
  },

  rogue: {
    sprite: "rogue.png",
    movementRange: 4,
    attributes: {
      hp: 14,
      armor: 14,
      damageMin: 2,
      damageMax: 4
    }
  },

  mage: {
    sprite: "mage.png",
    movementRange: 3,
    attributes: {
      hp: 12,
      armor: 12,
      damageMin: 4,
      damageMax: 8
    }
  }
};


// Cria o player instanciado
export function createPlayer(type) {
  const data = PlayerClasses[type];
  if (!data) throw new Error("Player não encontrado: " + type);

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
