function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Timings in ms, matched to the 30 fps knight sprite sheets and the monster keyframes in styles.css.
const SWORD_HIT_MS = 300;   // the sword lands on frame 9 of knight-attack
const SWING_END_MS = 270;   // rest of the 17-frame swing
const PAUSE_MS = 150;
const MONSTER_HIT_MS = 250; // middle of the 0.5 s monster lunge
const RECOVER_MS = 500;     // knight-hit is 15 frames

let fxId = 0;

const app = Vue.createApp({
    data() {
        const monsterHealth = 100 + getRandomInt(100);
        return {
            playerHealth: 100,
            monsterHealth: monsterHealth,
            monsterTotalHealth: monsterHealth,
            currentRound: 0,
            winner: null,
            log: [],
            busy: false,
            playerPose: 'idle',
            monsterPose: 'idle',
            playerFx: null,
            monsterFx: null
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
          if(this.busy) return;
          this.currentRound = 0;
          this.playerHealth = 100;
          this.monsterHealth= 100 + getRandomInt(100);
          this.monsterTotalHealth = this.monsterHealth;
          this.winner = null;
          this.log = [];
          this.playerPose = 'idle';
          this.monsterPose = 'idle';
          this.playerFx = null;
          this.monsterFx = null;
        },
        attackMonster(){
            this.takeTurn(() => this.strikeMonster(getRandomInt(10), 'You attacked!', 'damage'));
        },
        specialAttackMonster(){
            this.takeTurn(() => this.strikeMonster(getRandomInt(15), 'You made a superattack!', 'special'));
        },
        healPlayer(){
            this.takeTurn(async () => {
                const before = this.playerHealth;
                this.playerHealth = Math.min(this.playerHealth + getRandomInt(10), 100);
                this.log.push('You heal yourself!');
                this.showFx('player', '+' + (this.playerHealth - before), 'heal');
                this.playerPose = 'heal';
                await wait(SWORD_HIT_MS + SWING_END_MS);
                this.playerPose = 'idle';
            });
        },
        async takeTurn(playerMove){
            // Buttons stay enabled (and focused) while the turn plays out; extra clicks are ignored.
            if(this.busy || this.winner) return;
            this.busy = true;
            this.currentRound++;
            await playerMove();
            if(!this.winner){
                await wait(PAUSE_MS);
                await this.attackPlayer();
            }
            this.busy = false;
        },
        async strikeMonster(damage, message, fxKind){
            this.playerPose = 'attack';
            await wait(SWORD_HIT_MS);
            this.monsterHealth -= damage;
            this.log.push(message);
            this.showFx('monster', '-' + damage, fxKind);
            this.monsterPose = this.monsterHealth <= 0 ? 'dead' : 'hurt';
            await wait(SWING_END_MS);
            this.playerPose = 'idle';
        },
        async attackPlayer(){
            const damage = getRandomInt(8);
            this.monsterPose = 'attack';
            await wait(MONSTER_HIT_MS);
            this.playerHealth -= damage;
            this.log.push('Monster attacked!');
            this.showFx('player', '-' + damage, 'damage');
            this.playerPose = this.playerHealth <= 0 ? 'death' : 'hit';
            await wait(RECOVER_MS);
            this.monsterPose = 'idle';
            if(this.playerPose === 'hit'){
                this.playerPose = 'idle';
            }
        },
        showFx(side, text, kind){
            // A new key remounts the label, which restarts its CSS animation.
            this[side + 'Fx'] = { id: ++fxId, text, kind };
        },
        openSurrenderDialog(){
            if(this.busy) return;
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