const Score = {
    name: "Score",
    template: `
    <div class="team-wrapper">
        <p class="team-score" ref="teamScore"></p>
    </div>
    `,
    props: {
        total: Number,
        diff: Boolean,
    },
    data() {
        return {
            count: undefined
        }
    },
    mounted() {
        this.count = new CountUp(this.$refs.teamScore, 0, 0, 0, 0.5, { decimalPlaces: 2, useEasing: true, useGrouping: false, separator: "", decimal: ".", padDecimals: this.diff ? 0 : 8 });
    },
    watch: {
        total(newValue, oldValue) {
            // if this Score is calculating difference, indicate who is winning by colour
            if (this.diff) {
                if (newValue > 0) {
                    this.$refs.teamScore.className = "team-score blue-diff";
                }
                else if (newValue < 0) {
                    this.$refs.teamScore.className = "team-score red-diff";
                }
                else {
                    this.$refs.teamScore.className = "team-score grey-diff";
                }
            }
            this.count.update(Math.abs(newValue));
        }
    },
}

export default Score;