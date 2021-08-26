class Genre {
    constructor(
        baseCostForPerformance,
        minAudienceForAdditionalCost,
        fixedBonusForAudienceAboveThreshold,
        perTicketBonusForAudienceAboveThreshold,
        perTicketBonus,
        audienceChunk,
    ) {
        this.baseCostForPerformance = baseCostForPerformance;
        this.minAudienceForAdditionalCost = minAudienceForAdditionalCost;
        this.fixedBonusForAudienceAboveThreshold = fixedBonusForAudienceAboveThreshold;
        this.perTicketBonusForAudienceAboveThreshold = perTicketBonusForAudienceAboveThreshold;
        this.perTicketBonus = perTicketBonus;
        this.audienceChunk = audienceChunk;
    }

    calculateCost(perf) {
        let costForPerformance = this.baseCostForPerformance;
        if (perf.audience > this.minAudienceForAdditionalCost) {
            costForPerformance +=
                this.fixedBonusForAudienceAboveThreshold +
                this.perTicketBonusForAudienceAboveThreshold *
                    (perf.audience - this.minAudienceForAdditionalCost);
        }
        costForPerformance += this.perTicketBonus * perf.audience;
        return costForPerformance;
    }

    calculateVolumeCredits(perf) {
        let volumeCredits = 0;
        volumeCredits += Math.max(perf.audience - 30, 0);

        if (this.audienceChunk !== 0) {
            volumeCredits += Math.floor(perf.audience / this.audienceChunk);
        }

        return volumeCredits;
    }
}

class Comedy extends Genre {
    constructor() {
        super(30000, 20, 10000, 500, 300, 5);
    }
}

class Tragedy extends Genre {
    constructor() {
        super(40000, 30, 0, 1000, 0, 0);
    }
}

function calculateCostForTragedy(perf) {
    const genre = new Tragedy();
    return genre.calculateCost(perf);
}

function calculateCostForComedy(perf) {
    const genre = new Comedy();
    return genre.calculateCost(perf);
}

function calculateVolumeCreditsForTragedy(perf) {
    const genre = new Tragedy();
    return genre.calculateVolumeCredits(perf)
}

function calculateVolumeCreditsForComedy(perf) {
    const genre = new Comedy();
    return genre.calculateVolumeCredits(perf)
}

const genreConfigurator = {
    tragedy: {
        cost: calculateCostForTragedy,
        volumeCredits: calculateVolumeCreditsForTragedy,
    },
    comedy: {
        cost: calculateCostForComedy,
        volumeCredits: calculateVolumeCreditsForComedy,
    },
};

function calculateCost(perf, type) {
    if (!genreConfigurator[type]) {
        throw new Error(`unknown type: ${type}`);
    }
    return genreConfigurator[type].cost(perf);
}

function calculateVolumeCredits(perf, play) {
    return genreConfigurator[play["type"]].volumeCredits(perf);
}

function statement(invoice, plays) {
    let totalAmount = 0;
    let volumeCredits = 0;
    let result = `Statement for ${invoice.customer}\n`;
    const format = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format;

    for (let perf of invoice.performances) {
        const play = plays[perf.playID];
        const costForPerformance = calculateCost(perf, play.type);
        volumeCredits += calculateVolumeCredits(perf, play);

        // print line for this order
        result += ` ${play.name}: ${format(costForPerformance / 100)} (${
            perf.audience
        } seats)\n`;
        totalAmount += costForPerformance;
    }
    result += `Amount owed is ${format(totalAmount / 100)}\n`;
    result += `You earned ${volumeCredits} credits\n`;
    return result;
}

module.exports = statement;
