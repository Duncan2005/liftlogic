// One-rep max formulas. Each takes weight (w) and reps (r) and returns an estimated 1RM.
const formulas = {
  epley:    (w, r) => w * (1 + r / 30),
  brzycki:  (w, r) => (w * 36) / (37 - r),
  lombardi: (w, r) => w * Math.pow(r, 0.10),
  oconner:  (w, r) => w * (1 + 0.025 * r),
};

// Approximate reps you can do at a given % of 1RM (rule-of-thumb values).
const percentTable = [
  [100, 1], [95, 2], [90, 4], [85, 6], [80, 8],
  [75, 10], [70, 12], [65, 15], [60, 20],
];

function estimate1RM(weight, reps) {
  if (reps === 1) {
    return { epley: weight, brzycki: weight, lombardi: weight, oconner: weight, average: weight };
  }
  const out = {};
  let sum = 0;
  for (const [name, fn] of Object.entries(formulas)) {
    out[name] = fn(weight, reps);
    sum += out[name];
  }
  out.average = sum / Object.keys(formulas).length;
  return out;
}

function roundTo(value, step) {
  return Math.round(value / step) * step;
}

function fmt(value, unit) {
  const step = unit === "kg" ? 0.5 : 1;
  const rounded = roundTo(value, step);
  return (Number.isInteger(rounded) ? rounded : rounded.toFixed(1)) + " " + unit;
}

// Browser wiring (skipped when the file is loaded in Node for testing).
if (typeof document !== "undefined") {
  const form = document.getElementById("rm-form");
  const resultBox = document.getElementById("result");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const weight = parseFloat(document.getElementById("weight").value);
    const reps = parseInt(document.getElementById("reps").value, 10);
    const unit = document.getElementById("unit").value;

    if (!(weight > 0) || !(reps >= 1) || reps > 30) {
      resultBox.innerHTML = '<p class="warn">Please enter a weight above 0 and reps between 1 and 30.</p>';
      resultBox.classList.add("show");
      return;
    }

    const est = estimate1RM(weight, reps);

    let html = '<h2 style="margin-top:0">Your estimated 1RM</h2>';
    html += '<div class="big">' + fmt(est.average, unit) + "</div>";
    if (reps > 10) {
      html += '<p class="warn">Estimates get less accurate above 10 reps. For best results, use a set of 2 to 8 reps.</p>';
    }

    html += "<h2>By formula</h2><table><tr><th>Formula</th><th>Estimated 1RM</th></tr>";
    html += "<tr><td>Epley</td><td>" + fmt(est.epley, unit) + "</td></tr>";
    html += "<tr><td>Brzycki</td><td>" + fmt(est.brzycki, unit) + "</td></tr>";
    html += "<tr><td>Lombardi</td><td>" + fmt(est.lombardi, unit) + "</td></tr>";
    html += "<tr><td>O'Conner</td><td>" + fmt(est.oconner, unit) + "</td></tr></table>";

    html += "<h2>Training weights by % of 1RM</h2>";
    html += "<table><tr><th>% of 1RM</th><th>Weight</th><th>Approx. reps</th></tr>";
    for (const [pct, repsAt] of percentTable) {
      html += "<tr><td>" + pct + "%</td><td>" + fmt((est.average * pct) / 100, unit) +
              "</td><td>" + repsAt + "</td></tr>";
    }
    html += "</table>";

    resultBox.innerHTML = html;
    resultBox.classList.add("show");
  });
}

if (typeof module !== "undefined") {
  module.exports = { estimate1RM, formulas };
}
