function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

const app = Vue.createApp({
    data() {
        const monsterHealth = 100 + getRandomInt(100);
        return {
            playerHealth: 100,
            monsterHealth: monsterHealth,
            monsterTotalHealth: monsterHealth,
            currentRound: 0,
            winner: null,
            log: []
        };
    },
    computed:{
        playerHealthValue(){
            return Math.max(this.playerHealth, 0);
        },
        monsterHealthValue(){
            return Math.max(this.monsterHealth, 0);
        },
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
        specialAttackLocked(){
            return this.currentRound % 3 !== 0;
        },
        specialAttackHint(){
            if(!this.specialAttackLocked){
                return 'Special Attack is ready.';
            }
            const roundsLeft = 3 - (this.currentRound % 3);
            return 'Special Attack is available every 3 rounds: ' + roundsLeft + (roundsLeft === 1 ? ' round' : ' rounds') + ' to go.';
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
        },
        winner(value){
            // Keep keyboard focus on a usable button when the controls change.
            this.$nextTick(() => {
                (value ? this.$refs.newGameButton : this.$refs.attackButton).focus();
            });
        }
    },
    methods: {
        startNewGame(){
          this.currentRound = 0;
          this.playerHealth = 100;
          this.monsterHealth= 100 + getRandomInt(100);
          this.monsterTotalHealth = this.monsterHealth;
          this.winner = null;
          this.log = [];
        },
        attackMonster(){
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
        openSurrenderDialog(){
            const dialog = this.$refs.surrenderDialog;
            dialog.returnValue = '';
            dialog.showModal();
        },
        onSurrenderDialogClose(){
            // Escape and "Keep Fighting" both cancel; only the explicit button surrenders.
            if(this.$refs.surrenderDialog.returnValue === 'confirm'){
                this.surrenderPlayer();
            } else {
                this.$refs.surrenderButton.focus();
            }
        },
        surrenderPlayer(){
            this.log.push('You just surrender!')
            this.winner = 'monster';
        }
    }
});

app.mount('#game');