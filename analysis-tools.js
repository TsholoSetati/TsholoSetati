/**
 * Business Analysis Tools Suite
 * 8 integrated strategic analysis tools
 */

console.log('✓ analysis-tools.js loaded');

// Tab Navigation
function switchTab(tabName) {
  console.log('Switching to tab:', tabName);
  
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-button').forEach(el => el.classList.remove('active'));
  
  // Show selected tab
  const tabEl = document.getElementById(tabName);
  if (tabEl) {
    tabEl.classList.add('active');
    console.log('Tab activated:', tabName);
  } else {
    console.error('Tab element not found:', tabName);
  }
  
  // Mark active button
  const buttons = document.querySelectorAll('.tab-button');
  buttons.forEach(btn => {
    if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${tabName}'`)) {
      btn.classList.add('active');
    }
  });
}

// Update slider values
document.addEventListener('DOMContentLoaded', () => {
  console.log('✓ DOMContentLoaded event fired');
  
  // Initialize all sliders
  const sliders = document.querySelectorAll('.slider');
  console.log('Found sliders:', sliders.length);
  
  sliders.forEach(slider => {
    // Set initial value display
    const valueId = slider.id + 'Value';
    const valueElement = document.getElementById(valueId);
    if (valueElement) {
      valueElement.textContent = slider.value;
    }
    
    // Add input event listener
    slider.addEventListener('input', (e) => {
      const valueId = e.target.id + 'Value';
      const valueElement = document.getElementById(valueId);
      if (valueElement) {
        valueElement.textContent = e.target.value;
      }
    });
  });

  // Porter's 5 Forces
  const porterForm = document.getElementById('porterForm');
  if (porterForm) {
    console.log('✓ Porter form found');
    porterForm.addEventListener('submit', (e) => {
      console.log('Porter form submitted');
      e.preventDefault();
      analyzePorter();
    });
  } else {
    console.warn('Porter form not found');
  }

  // PESTEL
  const pestelForm = document.getElementById('pestelForm');
  if (pestelForm) {
    console.log('✓ PESTEL form found');
    pestelForm.addEventListener('submit', (e) => {
      console.log('PESTEL form submitted');
      e.preventDefault();
      analyzePESTEL();
    });
  } else {
    console.warn('PESTEL form not found');
  }

  // SWOT
  const swotForm = document.getElementById('swotForm');
  if (swotForm) {
    console.log('✓ SWOT form found');
    swotForm.addEventListener('submit', (e) => {
      console.log('SWOT form submitted');
      e.preventDefault();
      analyzeSWOT();
    });
  } else {
    console.warn('SWOT form not found');
  }

  // Segmentation
  const segmentForm = document.getElementById('segmentForm');
  if (segmentForm) {
    console.log('✓ Segmentation form found');
    segmentForm.addEventListener('submit', (e) => {
      console.log('Segmentation form submitted');
      e.preventDefault();
      analyzeSegmentation();
    });
  } else {
    console.warn('Segmentation form not found');
  }

  // Scenario
  const scenarioForm = document.getElementById('scenarioForm');
  if (scenarioForm) {
    console.log('✓ Scenario form found');
    scenarioForm.addEventListener('submit', (e) => {
      console.log('Scenario form submitted');
      e.preventDefault();
      analyzeScenario();
    });
  } else {
    console.warn('Scenario form not found');
  }

  // Positioning
  const positionForm = document.getElementById('positionForm');
  if (positionForm) {
    console.log('✓ Positioning form found');
    positionForm.addEventListener('submit', (e) => {
      console.log('Positioning form submitted');
      e.preventDefault();
      analyzePositioning();
    });
  } else {
    console.warn('Positioning form not found');
  }

  // Risk Matrix
  const riskForm = document.getElementById('riskForm');
  if (riskForm) {
    console.log('✓ Risk form found');
    riskForm.addEventListener('submit', (e) => {
      console.log('Risk form submitted');
      e.preventDefault();
      analyzeRisk();
    });
  } else {
    console.warn('Risk form not found');
  }
  
  console.log('✓ All event listeners initialized');
});

// PORTER'S 5 FORCES
function analyzePorter() {
  console.log('analyzePorter() called');
  
  try {
    const suppliers = parseInt(document.getElementById('suppliers').value);
    const buyers = parseInt(document.getElementById('buyers').value);
    const substitutes = parseInt(document.getElementById('substitutes').value);
    const entrants = parseInt(document.getElementById('entrants').value);
    const rivalry = parseInt(document.getElementById('rivalry').value);

    console.log('Forces:', { suppliers, buyers, substitutes, entrants, rivalry });

    const avgForce = (suppliers + buyers + substitutes + entrants + rivalry) / 5;
    const attractiveness = Math.round((25 - (avgForce * 4)) + 50);

    console.log('Attractiveness score:', attractiveness);

    const breakdown = `
      <div class="force-analysis">
        <div class="force-item">
          <span>Supplier Power:</span>
          <div class="force-bar" style="width: ${suppliers * 20}%"></div>
          <span>${suppliers}/5</span>
        </div>
        <div class="force-item">
          <span>Buyer Power:</span>
          <div class="force-bar" style="width: ${buyers * 20}%"></div>
          <span>${buyers}/5</span>
        </div>
        <div class="force-item">
          <span>Threat of Substitutes:</span>
          <div class="force-bar" style="width: ${substitutes * 20}%"></div>
          <span>${substitutes}/5</span>
        </div>
        <div class="force-item">
          <span>Threat of New Entrants:</span>
          <div class="force-bar" style="width: ${entrants * 20}%"></div>
          <span>${entrants}/5</span>
        </div>
        <div class="force-item">
          <span>Competitive Rivalry:</span>
          <div class="force-bar" style="width: ${rivalry * 20}%"></div>
          <span>${rivalry}/5</span>
        </div>
      </div>
    `;

    const recommendation = attractiveness > 60 ? 
      'Industry is ATTRACTIVE. Consider entry or expansion.' :
      attractiveness > 40 ?
      'Industry is MODERATELY ATTRACTIVE. Requires competitive advantage.' :
      'Industry is CHALLENGING. High competitive intensity, low margins.';

    const porterScoreEl = document.getElementById('porterScore');
    const porterBreakdownEl = document.getElementById('porterBreakdown');
    const porterResultEl = document.getElementById('porterResult');
    
    if (porterScoreEl && porterBreakdownEl && porterResultEl) {
      porterScoreEl.innerHTML = `${attractiveness}/100<br><small>${recommendation}</small>`;
      porterBreakdownEl.innerHTML = breakdown;
      porterResultEl.style.display = 'block';
      console.log('✓ Porter analysis displayed');
    } else {
      console.error('Missing result elements:', { porterScoreEl, porterBreakdownEl, porterResultEl });
    }
  } catch (err) {
    console.error('Error in analyzePorter:', err);
  }
}

// PESTEL ANALYSIS
function analyzePESTEL() {
  const factors = [];
  const pestelFactors = ['Political', 'Economic', 'Social', 'Technological', 'Environmental', 'Legal'];
  
  document.querySelectorAll('.pestel-factor').forEach((factor, idx) => {
    const text = factor.querySelector('textarea').value;
    const impact = factor.querySelector('.impact-select').value;
    factors.push({ name: pestelFactors[idx], text, impact });
  });

  let html = '<table style="width:100%; border-collapse: collapse; margin: 16px 0;">';
  html += '<tr style="background: rgba(14,165,233,0.1);"><th style="padding:8px; text-align:left;">Factor</th><th style="padding:8px;">Impact</th><th style="padding:8px; text-align:left;">Assessment</th></tr>';
  
  factors.forEach(f => {
    const color = f.impact === 'High' ? '#ef4444' : f.impact === 'Medium' ? '#f59e0b' : '#22c55e';
    html += `<tr style="border-bottom: 1px solid rgba(0,0,0,0.1);">
      <td style="padding:8px; font-weight:600;">${f.name}</td>
      <td style="padding:8px; color:${color}; font-weight:600;">${f.impact}</td>
      <td style="padding:8px;">${f.text}</td>
    </tr>`;
  });
  html += '</table>';

  document.getElementById('pestelBreakdown').innerHTML = html;
  document.getElementById('pestelResult').style.display = 'block';
}

// SWOT ANALYSIS
function analyzeSWOT() {
  const strengths = document.getElementById('strengths').value.split('\n').filter(s => s.trim());
  const weaknesses = document.getElementById('weaknesses').value.split('\n').filter(s => s.trim());
  const opportunities = document.getElementById('opportunities').value.split('\n').filter(s => s.trim());
  const threats = document.getElementById('threats').value.split('\n').filter(s => s.trim());

  let html = '<div class="swot-results-grid">';
  html += `<div class="swot-result positive"><strong>Strengths (${strengths.length})</strong><ul>${strengths.map(s => `<li>${s}</li>`).join('')}</ul></div>`;
  html += `<div class="swot-result negative"><strong>Weaknesses (${weaknesses.length})</strong><ul>${weaknesses.map(w => `<li>${w}</li>`).join('')}</ul></div>`;
  html += `<div class="swot-result positive"><strong>Opportunities (${opportunities.length})</strong><ul>${opportunities.map(o => `<li>${o}</li>`).join('')}</ul></div>`;
  html += `<div class="swot-result negative"><strong>Threats (${threats.length})</strong><ul>${threats.map(t => `<li>${t}</li>`).join('')}</ul></div>`;
  html += '</div>';

  const strategy = `
    <h4 style="margin-top: 24px;">Strategic Implications</h4>
    <p><strong>SO Strategy (Strengths → Opportunities):</strong> Leverage strengths to capitalize on market opportunities.</p>
    <p><strong>WO Strategy (Weaknesses → Opportunities):</strong> Address weaknesses to better exploit opportunities.</p>
    <p><strong>ST Strategy (Strengths → Threats):</strong> Use strengths to mitigate competitive threats.</p>
    <p><strong>WT Strategy (Weaknesses → Threats):</strong> Minimize weaknesses and threats exposure.</p>
  `;

  document.getElementById('swotBreakdown').innerHTML = html + strategy;
  document.getElementById('swotResult').style.display = 'block';
}

// MARKET SEGMENTATION
function analyzeSegmentation() {
  const segments = [];
  for (let i = 1; i <= 3; i++) {
    const name = document.getElementById(`seg${i}Name`).value;
    const desc = document.getElementById(`seg${i}Desc`).value;
    const attract = document.getElementById(`seg${i}Attract`).value;
    const size = parseInt(document.getElementById(`seg${i}Size`).value);
    segments.push({ name, desc, attract, size });
  }

  let html = '<div class="segment-results">';
  segments.forEach(s => {
    const color = s.attract === 'High' ? '#22c55e' : s.attract === 'Medium' ? '#f59e0b' : '#ef4444';
    html += `
      <div class="segment-card">
        <h4>${s.name}</h4>
        <p>${s.desc}</p>
        <div style="display: flex; justify-content: space-between; margin-top: 12px; font-weight: 600;">
          <span>Attractiveness: <span style="color:${color}">${s.attract}</span></span>
          <span>Market Share: ${s.size}%</span>
        </div>
      </div>
    `;
  });
  html += '</div>';

  const totalSize = segments.reduce((sum, s) => sum + s.size, 0);
  const recommendation = `
    <h4 style="margin-top: 24px;">Targeting Recommendation</h4>
    <p>Total addressable market: ${totalSize}%</p>
    <p>Priority segments: ${segments.filter(s => s.attract === 'High').map(s => s.name).join(', ') || 'None rated high'}</p>
  `;

  document.getElementById('segmentBreakdown').innerHTML = html + recommendation;
  document.getElementById('segmentResult').style.display = 'block';
}

// SCENARIO PLANNING
function analyzeScenario() {
  const investment = parseInt(document.getElementById('investment').value);
  const revenue1 = parseInt(document.getElementById('revenue').value);
  const margin = parseInt(document.getElementById('margin').value) / 100;
  const growth = parseInt(document.getElementById('growth').value) / 100;
  const years = parseInt(document.getElementById('years').value);
  const discount = parseInt(document.getElementById('discount').value) / 100;

  function projectScenario(growthRate, marginMultiplier) {
    let npv = -investment;
    let revenue = revenue1;
    for (let i = 1; i <= years; i++) {
      const profit = revenue * margin * marginMultiplier;
      npv += profit / Math.pow(1 + discount, i);
      revenue *= (1 + growthRate);
    }
    return { npv: Math.round(npv), finalRevenue: Math.round(revenue) };
  }

  const best = projectScenario(growth * 1.5, 1.3);
  const base = projectScenario(growth, 1.0);
  const worst = projectScenario(growth * 0.5, 0.7);

  const html = `
    <div class="scenario-results">
      <div class="scenario-card positive">
        <h4>Best Case</h4>
        <p>Growth: +${(growth * 150).toFixed(0)}%/year</p>
        <p><strong>NPV: R${best.npv.toLocaleString()}</strong></p>
        <p>Year ${years} Revenue: R${best.finalRevenue.toLocaleString()}</p>
      </div>
      <div class="scenario-card">
        <h4>Base Case</h4>
        <p>Growth: ${(growth * 100).toFixed(0)}%/year</p>
        <p><strong>NPV: R${base.npv.toLocaleString()}</strong></p>
        <p>Year ${years} Revenue: R${base.finalRevenue.toLocaleString()}</p>
      </div>
      <div class="scenario-card negative">
        <h4>Worst Case</h4>
        <p>Growth: ${(growth * 50).toFixed(0)}%/year</p>
        <p><strong>NPV: R${worst.npv.toLocaleString()}</strong></p>
        <p>Year ${years} Revenue: R${worst.finalRevenue.toLocaleString()}</p>
      </div>
    </div>
  `;

  document.getElementById('scenarioBreakdown').innerHTML = html;
  document.getElementById('scenarioResult').style.display = 'block';
}

// POSITIONING MAP
function analyzePositioning() {
  const xAttr = document.getElementById('xAttr').value;
  const yAttr = document.getElementById('yAttr').value;
  const competitors = [];

  document.querySelectorAll('.competitor-entry').forEach(entry => {
    const name = entry.querySelector('input').value;
    const x = parseInt(entry.querySelectorAll('input')[1].value);
    const y = parseInt(entry.querySelectorAll('input')[2].value);
    const color = entry.querySelector('input[type="color"]').value;
    competitors.push({ name, x, y, color });
  });

  const canvas = document.getElementById('positionCanvas');
  canvas.width = 500;
  canvas.height = 500;
  const ctx = canvas.getContext('2d');

  // Draw axes
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(50, 250);
  ctx.lineTo(450, 250);
  ctx.moveTo(250, 50);
  ctx.lineTo(250, 450);
  ctx.stroke();

  // Labels
  ctx.fillStyle = '#666';
  ctx.font = '12px Arial';
  ctx.fillText(xAttr.split('(')[0], 400, 270);
  ctx.fillText(yAttr.split('(')[0], 260, 30);

  // Plot competitors
  competitors.forEach(c => {
    const x = 50 + (c.x / 10) * 400;
    const y = 450 - (c.y / 10) * 400;
    
    ctx.fillStyle = c.color;
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(c.name.substring(0, 10), x, y);
  });

  // Identify white space
  const avgX = competitors.reduce((sum, c) => sum + c.x, 0) / competitors.length;
  const avgY = competitors.reduce((sum, c) => sum + c.y, 0) / competitors.length;

  const insights = `
    <h4>Positioning Insights</h4>
    <p><strong>Market Clusters:</strong> Competitors are ${competitors.length > 1 ? 'clustered' : ''} around ${avgX.toFixed(1)}, ${avgY.toFixed(1)}</p>
    <p><strong>White Space:</strong> Opportunities exist in underserved regions of the map.</p>
    <p><strong>Recommendation:</strong> Consider positioning in differentiated areas to avoid direct competition.</p>
  `;

  document.getElementById('positionInsights').innerHTML = insights;
  document.getElementById('positionResult').style.display = 'block';
}

// RISK MATRIX
function analyzeRisk() {
  const risks = [];
  document.querySelectorAll('.risk-entry').forEach(entry => {
    const name = entry.querySelector('input').value;
    const probability = entry.querySelectorAll('select')[0].value;
    const impact = entry.querySelectorAll('select')[1].value;
    const mitigation = entry.querySelectorAll('input')[1].value;
    risks.push({ name, probability, impact, mitigation });
  });

  // Create risk matrix canvas
  const canvas = document.getElementById('riskCanvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, 400, 400);

  // Risk zones
  ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
  ctx.fillRect(0, 250, 400, 150);
  ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';
  ctx.fillRect(0, 150, 200, 250);
  ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
  ctx.fillRect(200, 0, 200, 250);

  // Grid
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 133, 0);
    ctx.lineTo(i * 133, 400);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * 133);
    ctx.lineTo(400, i * 133);
    ctx.stroke();
  }

  // Plot risks
  risks.forEach(r => {
    const probNum = r.probability === 'High' ? 2.5 : r.probability === 'Medium' ? 1.5 : 0.5;
    const impactNum = r.impact === 'High' ? 2.5 : r.impact === 'Medium' ? 1.5 : 0.5;
    const x = 50 + probNum * 110;
    const y = 350 - impactNum * 110;

    ctx.fillStyle = '#0ea5e9';
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
  });

  // Labels
  ctx.fillStyle = '#666';
  ctx.font = '12px Arial';
  ctx.fillText('Probability →', 350, 385);
  ctx.save();
  ctx.translate(15, 200);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Impact →', 0, 0);
  ctx.restore();

  // Prioritized risks
  const sorted = risks.sort((a, b) => {
    const scoreA = (a.probability === 'High' ? 3 : a.probability === 'Medium' ? 2 : 1) * 
                   (a.impact === 'High' ? 3 : a.impact === 'Medium' ? 2 : 1);
    const scoreB = (b.probability === 'High' ? 3 : b.probability === 'Medium' ? 2 : 1) * 
                   (b.impact === 'High' ? 3 : b.impact === 'Medium' ? 2 : 1);
    return scoreB - scoreA;
  });

  let priorityHtml = '<h4>Risk Priorities</h4><ol>';
  sorted.slice(0, 5).forEach(r => {
    const severity = (r.probability === 'High' && r.impact === 'High') ? 'CRITICAL' :
                    (r.probability === 'High' || r.impact === 'High') ? 'HIGH' : 'MEDIUM';
    priorityHtml += `<li><strong>${r.name}</strong> (${severity}): ${r.mitigation}</li>`;
  });
  priorityHtml += '</ol>';

  document.getElementById('riskPriorities').innerHTML = priorityHtml;
  document.getElementById('riskResult').style.display = 'block';
}

// PDF DOWNLOAD
function downloadPDF(tabId, filename) {
  const element = document.getElementById(tabId);
  const opt = {
    margin: 10,
    filename: `${filename}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
  };
  
  html2pdf().set(opt).from(element).save();
}
