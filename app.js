function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

const app = Vue.createApp({
    data() {
        return {
            playerHealth: 100,
            monsterHealth: 100 + getRandomInt(100),
            monsterTotalHealth: 0,
            currentRound: 0,
            winner: null,
            log: []
        };
    },
    computed:{
        playerLifeStyle(){
            if(this.playerHealth <= 0){
                return {width: '0%'};
            }
            return {width: this.playerHealth+'%'};
        },
        monsterLifeStyle(){
            if(this.monsterHealth <= 0){
                return {width: '0%'};
            }
            return{width: (this.monsterHealth/this.monsterTotalHealth)*100+'%'};
        },
        useSpecialAttack(){
            return this.currentRound % 3 !== 0;
        }
    },
    watch:{
        playerHealth(value){
            if(value<=0){
                this.winner = 'monster';
            }
        },
        monsterHealth(value){
            if(value<=0){
                this.winner = 'player';
            }
        }
    },
    methods: {
        startNewGame(){
          this.currentRound = 0;
          this.playerHealth = 100;
          this.monsterHealth= 100 + getRandomInt(100);
          this.winner = null;
          this.log = [];
        },
        attackMonster(){
            if (this.currentRound === 0) {
                this.monsterTotalHealth = this.monsterHealth;
            }
            this.currentRound++;
            this.monsterHealth -= getRandomInt(10);
            this.log.push('You attacked!')
            this.attackPlayer();

        },
        attackPlayer(){
            this.playerHealth -= getRandomInt(8);
            this.log.push('Monster attacked!')
        },
        specialAttackMonster(){
            this.currentRound++;
            this.monsterHealth -= getRandomInt(15);
            this.log.push('You made a superattack!')
            this.attackPlayer();
        },
        healPlayer(){
            this.currentRound++;
            this.playerHealth += getRandomInt(10);
            if(this.playerHealth > 100){
                this.playerHealth = 100;
            }
            this.log.push('You heal yourself!')
            this.attackPlayer();
        },
        surrenderPlayer(){
            this.log.push('You just surrender!')
            this.winner = 'monster';
        }
    }
});

app.mount('#game');