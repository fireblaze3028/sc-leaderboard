const Player = {
    name: 'Player',
    template: `
        <div class="player" :class="{'top-red': reverse && (this.token.TeamPosition == 1), 'top-blue': !reverse && (this.token.TeamPosition == 1), 'red': reverse, 'main-player': main, 'top-main': main && (this.token.TeamPosition == 1), 'reverse-row': reverse }" :style="{ transform: 'translateY(' + (this.cap ? ((this.token.TeamPosition - 1) * 11.25) : this.token.Offset) + 'vh)' }">
            <img v-if="main && (token.Username == this.user)" v-bind:src="'https://a.ppy.sh/' + token.banchoId + '?.jpeg'" class='pfp' />
            <div class="info flex">
                <div class="username-placement-container" :class="{ 'reverse-row': reverse }">
                    <p class="username" :class="{'failing': !token.IsPassing }">{{ token.Username }}</p>
                    <p v-if="!main || (token.Username != this.user)" class="mods">{{ token.DisplayMods }}</p>
                    <div class="flex"></div>
                    <p class="placement" :class="{'golden': (this.token.TeamPosition == 1), 'silver': (this.token.TeamPosition == 2), 'bronze': (this.token.TeamPosition == 3)}">#{{ token.TeamPosition }}</p>
                </div>
                <div class="flex"></div>
                <div class="scoring" :class="{ 'reverse-row': reverse }">
                    <div class="hits-score">
                        <div class="hits">
                            <p class="hun small flex">{{ token.Hit100 }}</p>
                            <p class="fiv small flex">{{ token.Hit50 }}</p>
                            <p class="miss small flex">{{ token.HitMiss }}</p>
                        </div>
                        <p class="large" ref="score" :class="{ 'right': reverse }">0</p>
                    </div>
                    <div class="flex"></div>
                    <div class="combo-accuracy">
                        <p class="small" :class="{ 'right': !reverse }"><span ref="acc" class="small"></span>%</p>
                        <p class="large" :class="{ 'right': !reverse }"><span ref="combo" class="large"></span>x</p>
                    </div>
                </div>
            </div>
         </div>
    `,
    props: {
        token: Object,
        main: Boolean,
        user: String,
        reverse: Boolean,
        cap: Boolean,
    },
    data() {
        return {
            scoreCount: undefined,
            comboCount: undefined,
            accCount: undefined,
        }
    },
    mounted() {
        this.scoreCount = new CountUp(this.$refs.score, 0, 0, 0, 0.5, { decimalPlaces: 2, useEasing: true, useGrouping: true, separator: ",", decimal: "." })
        this.comboCount = new CountUp(this.$refs.combo, 0, 0, 0, 0.5, { decimalPlaces: 2, useEasing: false, useGrouping: true, separator: ",", decimal: "." })
        this.accCount = new CountUp(this.$refs.acc, 0, 0, 2, 0.5, { decimalPlaces: 2, useEasing: true, useGrouping: true, separator: ",", decimal: "." })
    },
    watch: {
        token(newValue, oldValue) {
            this.scoreCount.update(newValue.Score);
            this.comboCount.update(newValue.DisplayCombo);
            this.accCount.update(newValue.Accuracy);
        }
    },
};

export default Player;