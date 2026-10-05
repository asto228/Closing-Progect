/**
 * NutriTrack - Pure Vanilla JavaScript Calorie & Macro Tracker
 * WebStorage Persistence (localStorage) - Zero Frameworks
 */

(function () {
  'use strict';

  // --- STORAGE KEY & DEFAULT DATA ---
  const STORAGE_KEY = 'nutritrack_db_v1';

  const DEFAULT_SETTINGS = {
    calorieGoal: 2100,
    proteinGoal: 140,
    carbsGoal: 220,
    fatGoal: 65,
    waterGoal: 2500,
    userName: 'Alex'
  };

  // Preset Foods Catalog
  const FOOD_PRESETS = [
    {
      name: 'Greek Yogurt & Berries',
      icon: '🥣',
      meal: 'breakfast',
      serving: '200g bowl',
      calories: 180,
      protein: 17,
      carbs: 20,
      fat: 3
    },
    {
      name: 'Scrambled Eggs & Toast',
      icon: '🍳',
      meal: 'breakfast',
      serving: '2 eggs + 1 slice',
      calories: 260,
      protein: 15,
      carbs: 18,
      fat: 14
    },
    {
      name: 'Avocado Sourdough Toast',
      icon: '🥑',
      meal: 'breakfast',
      serving: '1 slice (120g)',
      calories: 240,
      protein: 6,
      carbs: 24,
      fat: 14
    },
    {
      name: 'Grilled Chicken Salad',
      icon: '🥗',
      meal: 'lunch',
      serving: '1 bowl (300g)',
      calories: 360,
      protein: 38,
      carbs: 14,
      fat: 15
    },
    {
      name: 'Turkey & Swiss Wrap',
      icon: '🌯',
      meal: 'lunch',
      serving: '1 wrap (220g)',
      calories: 410,
      protein: 30,
      carbs: 38,
      fat: 14
    },
    {
      name: 'Quinoa & Chickpea Bowl',
      icon: '🍲',
      meal: 'lunch',
      serving: '1 bowl (280g)',
      calories: 380,
      protein: 14,
      carbs: 56,
      fat: 10
    },
    {
      name: 'Baked Salmon & Asparagus',
      icon: '🐟',
      meal: 'dinner',
      serving: '200g fillet + veg',
      calories: 440,
      protein: 40,
      carbs: 8,
      fat: 26
    },
    {
      name: 'Steak & Sweet Potato',
      icon: '🥩',
      meal: 'dinner',
      serving: '250g plate',
      calories: 520,
      protein: 44,
      carbs: 36,
      fat: 18
    },
    {
      name: 'Tofu & Broccoli Stir Fry',
      icon: '🥢',
      meal: 'dinner',
      serving: '1 bowl (300g)',
      calories: 330,
      protein: 22,
      carbs: 28,
      fat: 14
    },
    {
      name: 'Whey Protein Shake',
      icon: '🥤',
      meal: 'snack',
      serving: '1 scoop + water',
      calories: 130,
      protein: 25,
      carbs: 3,
      fat: 2
    },
    {
      name: 'Apple & Almond Butter',
      icon: '🍏',
      meal: 'snack',
      serving: '1 apple + 1 tbsp',
      calories: 190,
      protein: 4,
      carbs: 26,
      fat: 9
    },
    {
      name: 'Mixed Raw Nuts',
      icon: '🥜',
      meal: 'snack',
      serving: '30g handful',
      calories: 185,
      protein: 5,
      carbs: 6,
      fat: 16
    }
  ];

  // Helper to format Date to YYYY-MM-DD
  function formatDateKey(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // --- STATE ---
  let appState = {
    settings: { ...DEFAULT_SETTINGS },
    days: {},
    currentDate: formatDateKey(new Date()),
    activeMealFilter: 'all',
    searchQuery: ''
  };

  // --- LOCAL STORAGE MANAGER ---
  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          appState.settings = { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) };
          appState.days = parsed.days || {};
          return true;
        }
      }
    } catch (e) {
      console.error('Error reading from localStorage:', e);
    }
    return false;
  }

  function saveToStorage() {
    try {
      const dataToSave = {
        settings: appState.settings,
        days: appState.days,
        version: '1.0',
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
      showToast('Storage quota exceeded or unavailable', 'danger');
    }
  }

  // Initial sample data generation for first time visitors
  function seedSampleData() {
    const today = new Date();
    const todayKey = formatDateKey(today);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = formatDateKey(yesterday);

    appState.days[todayKey] = {
      water: 1500,
      foods: [
        {
          id: 'food_' + Date.now() + '_1',
          name: 'Oatmeal with Blueberries & Honey',
          meal: 'breakfast',
          serving: '1 bowl (250g)',
          calories: 310,
          protein: 10,
          carbs: 56,
          fat: 5,
          time: '08:15'
        },
        {
          id: 'food_' + Date.now() + '_2',
          name: 'Greek Yogurt 2%',
          meal: 'breakfast',
          serving: '150g',
          calories: 130,
          protein: 15,
          carbs: 7,
          fat: 3,
          time: '08:25'
        },
        {
          id: 'food_' + Date.now() + '_3',
          name: 'Grilled Chicken Breast & Quinoa',
          meal: 'lunch',
          serving: '320g bowl',
          calories: 480,
          protein: 45,
          carbs: 42,
          fat: 12,
          time: '12:45'
        },
        {
          id: 'food_' + Date.now() + '_4',
          name: 'Avocado Garden Salad',
          meal: 'lunch',
          serving: '1 side plate',
          calories: 180,
          protein: 3,
          carbs: 10,
          fat: 15,
          time: '13:00'
        },
        {
          id: 'food_' + Date.now() + '_5',
          name: 'Whey Protein Shake',
          meal: 'snack',
          serving: '1 shaker',
          calories: 140,
          protein: 26,
          carbs: 4,
          fat: 2,
          time: '16:30'
        },
        {
          id: 'food_' + Date.now() + '_6',
          name: 'Wild Salmon Fillet & Steamed Rice',
          meal: 'dinner',
          serving: '280g plate',
          calories: 540,
          protein: 42,
          carbs: 45,
          fat: 18,
          time: '19:15'
        }
      ],
      exercises: [
        {
          id: 'ex_' + Date.now() + '_1',
          name: 'Morning Jog in Park',
          duration: 25,
          calories: 220,
          time: '07:15'
        }
      ]
    };

    appState.days[yesterdayKey] = {
      water: 2250,
      foods: [
        {
          id: 'food_' + (Date.now() - 86400000) + '_1',
          name: 'Scrambled Eggs with Avocado',
          meal: 'breakfast',
          serving: '2 eggs + 1/2 avocado',
          calories: 340,
          protein: 16,
          carbs: 8,
          fat: 26,
          time: '08:30'
        },
        {
          id: 'food_' + (Date.now() - 86400000) + '_2',
          name: 'Turkey Wrap with Greens',
          meal: 'lunch',
          serving: '1 wrap',
          calories: 420,
          protein: 32,
          carbs: 40,
          fat: 14,
          time: '13:10'
        },
        {
          id: 'food_' + (Date.now() - 86400000) + '_3',
          name: 'Sirloin Steak & Veggies',
          meal: 'dinner',
          serving: '1 portion',
          calories: 580,
          protein: 48,
          carbs: 18,
          fat: 28,
          time: '19:40'
        }
      ],
      exercises: [
        {
          id: 'ex_' + (Date.now() - 86400000) + '_1',
          name: 'Strength & Core Workout',
          duration: 45,
          calories: 290,
          time: '18:00'
        }
      ]
    };

    saveToStorage();
  }

  // Ensure current day container exists
  function getDayData(dateKey) {
    if (!appState.days[dateKey]) {
      appState.days[dateKey] = {
        water: 0,
        foods: [],
        exercises: []
      };
    }
    return appState.days[dateKey];
  }

  // --- TOAST NOTIFICATIONS ---
  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (type === 'danger') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
    } else {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }

    toast.innerHTML = `<span>${iconSvg}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px) scale(0.95)';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3200);
  }

  // --- DATE NAVIGATION & FORMATTING ---
  function updateDateDisplay() {
    const parts = appState.currentDate.split('-');
    const curDateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    
    const todayStr = formatDateKey(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDateKey(yesterday);

    let prefix = '';
    if (appState.currentDate === todayStr) {
      prefix = 'Today, ';
    } else if (appState.currentDate === yesterdayStr) {
      prefix = 'Yesterday, ';
    }

    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const dateFormatted = curDateObj.toLocaleDateString('en-US', options);

    const labelElem = document.getElementById('date-label-text');
    if (labelElem) {
      labelElem.textContent = prefix + dateFormatted;
    }

    const inputElem = document.getElementById('date-picker-input');
    if (inputElem) {
      inputElem.value = appState.currentDate;
    }
  }

  function shiftDate(daysCount) {
    const parts = appState.currentDate.split('-');
    const curDateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    curDateObj.setDate(curDateObj.getDate() + daysCount);
    appState.currentDate = formatDateKey(curDateObj);
    renderAll();
  }

  // --- CALCULATION & RENDERING ---
  function renderAll() {
    updateDateDisplay();
    renderSummaryCards();
    renderMealsList();
    renderExercisesList();
  }

  function renderSummaryCards() {
    const dayData = getDayData(appState.currentDate);
    const settings = appState.settings;

    // Calculate Food Totals
    let totalFoodCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    dayData.foods.forEach(f => {
      totalFoodCalories += Number(f.calories) || 0;
      totalProtein += Number(f.protein) || 0;
      totalCarbs += Number(f.carbs) || 0;
      totalFat += Number(f.fat) || 0;
    });

    // Calculate Exercise Burn
    let totalBurned = 0;
    dayData.exercises.forEach(e => {
      totalBurned += Number(e.calories) || 0;
    });

    // Net Calories = Eaten - Burned
    const netCalories = totalFoodCalories - totalBurned;
    // Remaining = Goal - Net
    const caloriesRemaining = settings.calorieGoal - netCalories;

    // Update Elements
    const targetGoalElem = document.getElementById('target-goal-val');
    const foodEatenElem = document.getElementById('food-eaten-val');
    const exerciseBurnElem = document.getElementById('exercise-burned-val');
    const calRemainingElem = document.getElementById('calories-remaining-val');
    const calRemainingLabel = document.getElementById('calories-remaining-label');
    const netCalElem = document.getElementById('net-calories-text');
    const calPercentElem = document.getElementById('calorie-percent-text');
    const calLinearFill = document.getElementById('calorie-linear-fill');
    const gaugeBar = document.getElementById('gauge-progress');
    const statusPill = document.getElementById('calorie-status-pill');

    if (targetGoalElem) targetGoalElem.textContent = settings.calorieGoal.toLocaleString();
    if (foodEatenElem) foodEatenElem.textContent = totalFoodCalories.toLocaleString();
    if (exerciseBurnElem) exerciseBurnElem.textContent = totalBurned.toLocaleString();
    if (netCalElem) netCalElem.textContent = `Net: ${netCalories.toLocaleString()} kcal`;

    if (calRemainingElem) {
      calRemainingElem.textContent = Math.abs(caloriesRemaining).toLocaleString();
    }
    if (calRemainingLabel) {
      calRemainingLabel.textContent = caloriesRemaining >= 0 ? 'kcal remaining' : 'kcal over target';
    }

    // Gauge calculation (r=68, circumference ~ 427.26)
    const circumference = 427.26;
    const progressFraction = settings.calorieGoal > 0 ? (totalFoodCalories / settings.calorieGoal) : 0;
    const offset = Math.max(0, circumference - (progressFraction * circumference));

    if (gaugeBar) {
      gaugeBar.style.strokeDashoffset = offset;
      if (totalFoodCalories > settings.calorieGoal) {
        gaugeBar.style.stroke = '#f43f5e'; // red alert
      } else if (progressFraction > 0.85) {
        gaugeBar.style.stroke = '#fbbf24'; // near goal
      } else {
        gaugeBar.style.stroke = '#10b981'; // green on track
      }
    }

    const pctReached = Math.round(progressFraction * 100);
    if (calPercentElem) {
      calPercentElem.textContent = `${pctReached}% of daily target reached`;
    }
    if (calLinearFill) {
      calLinearFill.style.width = `${Math.min(100, pctReached)}%`;
      if (totalFoodCalories > settings.calorieGoal) {
        calLinearFill.style.background = 'linear-gradient(90deg, #e11d48 0%, #fb7185 100%)';
      } else {
        calLinearFill.style.background = 'linear-gradient(90deg, #10b981 0%, #34d399 100%)';
      }
    }

    if (statusPill) {
      if (totalFoodCalories > settings.calorieGoal) {
        statusPill.textContent = 'Over Target';
        statusPill.className = 'status-pill status-over';
      } else if (pctReached >= 85) {
        statusPill.textContent = 'Almost Full';
        statusPill.className = 'status-pill status-warning';
      } else {
        statusPill.textContent = 'On Track';
        statusPill.className = 'status-pill status-normal';
      }
    }

    // Macros Rendering
    renderMacros(totalProtein, totalCarbs, totalFat, settings);

    // Water Rendering
    renderWater(dayData.water || 0, settings.waterGoal);
  }

  function renderMacros(protein, carbs, fat, settings) {
    // Protein
    const protConsumed = document.getElementById('protein-consumed-val');
    const protTarget = document.getElementById('protein-target-val');
    const protPercent = document.getElementById('protein-percent-val');
    const protBar = document.getElementById('protein-bar-fill');

    const protPct = Math.round((protein / (settings.proteinGoal || 1)) * 100);
    if (protConsumed) protConsumed.textContent = Math.round(protein);
    if (protTarget) protTarget.textContent = `${settings.proteinGoal}g`;
    if (protPercent) protPercent.textContent = `(${protPct}%)`;
    if (protBar) protBar.style.width = `${Math.min(100, protPct)}%`;

    // Carbs
    const carbsConsumed = document.getElementById('carbs-consumed-val');
    const carbsTarget = document.getElementById('carbs-target-val');
    const carbsPercent = document.getElementById('carbs-percent-val');
    const carbsBar = document.getElementById('carbs-bar-fill');

    const carbsPct = Math.round((carbs / (settings.carbsGoal || 1)) * 100);
    if (carbsConsumed) carbsConsumed.textContent = Math.round(carbs);
    if (carbsTarget) carbsTarget.textContent = `${settings.carbsGoal}g`;
    if (carbsPercent) carbsPercent.textContent = `(${carbsPct}%)`;
    if (carbsBar) carbsBar.style.width = `${Math.min(100, carbsPct)}%`;

    // Fat
    const fatConsumed = document.getElementById('fat-consumed-val');
    const fatTarget = document.getElementById('fat-target-val');
    const fatPercent = document.getElementById('fat-percent-val');
    const fatBar = document.getElementById('fat-bar-fill');

    const fatPct = Math.round((fat / (settings.fatGoal || 1)) * 100);
    if (fatConsumed) fatConsumed.textContent = Math.round(fat);
    if (fatTarget) fatTarget.textContent = `${settings.fatGoal}g`;
    if (fatPercent) fatPercent.textContent = `(${fatPct}%)`;
    if (fatBar) fatBar.style.width = `${Math.min(100, fatPct)}%`;

    // Macro Energy Distribution
    const protKcal = protein * 4;
    const carbKcal = carbs * 4;
    const fatKcal = fat * 9;
    const totalMacroKcal = protKcal + carbKcal + fatKcal;

    let pDist = 0, cDist = 0, fDist = 0;
    if (totalMacroKcal > 0) {
      pDist = Math.round((protKcal / totalMacroKcal) * 100);
      cDist = Math.round((carbKcal / totalMacroKcal) * 100);
      fDist = 100 - (pDist + cDist);
    }

    const distProt = document.getElementById('dist-protein');
    const distCarb = document.getElementById('dist-carbs');
    const distFat = document.getElementById('dist-fat');
    const distProtPct = document.getElementById('dist-protein-pct');
    const distCarbPct = document.getElementById('dist-carbs-pct');
    const distFatPct = document.getElementById('dist-fat-pct');

    if (distProt) distProt.style.width = `${pDist}%`;
    if (distCarb) distCarb.style.width = `${cDist}%`;
    if (distFat) distFat.style.width = `${fDist}%`;

    if (distProtPct) distProtPct.textContent = `${pDist}%`;
    if (distCarbPct) distCarbPct.textContent = `${cDist}%`;
    if (distFatPct) distFatPct.textContent = `${fDist}%`;
  }

  function renderWater(waterConsumed, waterGoal) {
    const consumedValElem = document.getElementById('water-consumed-val');
    const goalValElem = document.getElementById('water-goal-val');
    const percentBadge = document.getElementById('water-percent-badge');
    const liquidFill = document.getElementById('water-liquid-fill');
    const tipText = document.getElementById('water-tip-text');

    if (consumedValElem) consumedValElem.textContent = waterConsumed.toLocaleString();
    if (goalValElem) goalValElem.textContent = waterGoal.toLocaleString();

    const pct = waterGoal > 0 ? Math.round((waterConsumed / waterGoal) * 100) : 0;
    if (percentBadge) percentBadge.textContent = `${pct}%`;
    if (liquidFill) liquidFill.style.height = `${Math.min(100, Math.max(0, pct))}%`;

    if (tipText) {
      const remaining = waterGoal - waterConsumed;
      if (remaining <= 0) {
        tipText.textContent = '🎉 Goal reached! Fantastic job staying hydrated today!';
      } else {
        tipText.textContent = `Drink ${remaining.toLocaleString()} ml more to meet today's hydration target.`;
      }
    }
  }

  function renderExercisesList() {
    const container = document.getElementById('exercise-list-container');
    if (!container) return;

    const dayData = getDayData(appState.currentDate);
    const exercises = dayData.exercises || [];

    if (exercises.length === 0) {
      container.innerHTML = `
        <div class="exercise-empty">
          <span>No exercises logged yet today.</span>
        </div>
      `;
      return;
    }

    container.innerHTML = exercises.map(ex => `
      <div class="exercise-item" data-id="${ex.id}">
        <div class="exercise-left">
          <span class="exercise-icon-sym">⚡</span>
          <div>
            <div class="exercise-name">${escapeHtml(ex.name)}</div>
            <div class="exercise-dur">${ex.duration ? ex.duration + ' min' : ''} ${ex.time ? '&bull; ' + ex.time : ''}</div>
          </div>
        </div>
        <div class="exercise-right">
          <span class="exercise-burn-val">-${ex.calories} kcal</span>
          <button class="exercise-del-btn" data-id="${ex.id}" title="Delete exercise">&times;</button>
        </div>
      </div>
    `).join('');
  }

  function renderMealsList() {
    const dayData = getDayData(appState.currentDate);
    const meals = ['breakfast', 'lunch', 'dinner', 'snack'];
    const filter = appState.activeMealFilter;
    const query = appState.searchQuery.trim().toLowerCase();

    meals.forEach(meal => {
      const block = document.getElementById(`block-${meal}`);
      const listElem = document.getElementById(`list-${meal}`);
      const subtotalElem = document.getElementById(`subtotal-cal-${meal}`);

      if (!block || !listElem) return;

      // Check filter
      if (filter !== 'all' && filter !== meal) {
        block.style.display = 'none';
        return;
      } else {
        block.style.display = 'block';
      }

      // Filter food items
      const mealFoods = (dayData.foods || []).filter(f => f.meal === meal);
      const subtotalCal = mealFoods.reduce((acc, f) => acc + (Number(f.calories) || 0), 0);
      if (subtotalElem) subtotalElem.textContent = subtotalCal.toLocaleString();

      const matchedFoods = mealFoods.filter(f => {
        if (!query) return true;
        return (f.name && f.name.toLowerCase().includes(query)) ||
               (f.serving && f.serving.toLowerCase().includes(query));
      });

      if (matchedFoods.length === 0) {
        listElem.innerHTML = `
          <div class="food-empty-state">
            ${query ? `No items matching "${escapeHtml(query)}" in this meal.` : `No items logged for ${capitalize(meal)} yet. Click "Add" above!`}
          </div>
        `;
        return;
      }

      listElem.innerHTML = matchedFoods.map(f => `
        <div class="food-row" data-id="${f.id}">
          <div class="food-item-info">
            <div class="food-item-header">
              <span class="food-item-name">${escapeHtml(f.name)}</span>
              ${f.serving ? `<span class="food-item-portion">${escapeHtml(f.serving)}</span>` : ''}
            </div>
            <div class="food-item-macros">
              <span class="macro-chip macro-chip-protein">P: ${f.protein || 0}g</span>
              <span class="macro-chip macro-chip-carbs">C: ${f.carbs || 0}g</span>
              <span class="macro-chip macro-chip-fat">F: ${f.fat || 0}g</span>
              ${f.time ? `<span style="color: #64748b; font-size: 0.72rem;">&bull; ${f.time}</span>` : ''}
            </div>
          </div>
          <div class="food-item-meta">
            <div class="food-item-calories">
              <span class="food-calories-num">${Number(f.calories) || 0}</span>
              <span class="food-calories-unit">kcal</span>
            </div>
            <div class="food-item-actions">
              <button class="food-action-btn food-action-edit" data-id="${f.id}" title="Edit food entry">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="food-action-btn food-action-delete" data-id="${f.id}" title="Delete food entry">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `).join('');
    });
  }

  // --- MODAL UTILITIES ---
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    });
    document.body.style.overflow = '';
  }

  // --- FOOD MODAL & PRESETS ---
  function setupFoodModal() {
    const foodModal = document.getElementById('food-modal');
    const foodForm = document.getElementById('food-form');
    const modalTitle = document.getElementById('food-modal-title');
    const editIdInput = document.getElementById('food-edit-id');
    const mealSelect = document.getElementById('food-meal-select');
    const tabCustomBtn = document.getElementById('tab-custom-btn');
    const tabPresetsBtn = document.getElementById('tab-presets-btn');
    const presetsPanel = document.getElementById('presets-panel');
    const presetGrid = document.getElementById('preset-grid');
    const autoCalEstimate = document.getElementById('auto-cal-estimate');
    const useMacroCalcBtn = document.getElementById('use-macro-calc-btn');

    // Populate Presets Grid
    if (presetGrid) {
      presetGrid.innerHTML = FOOD_PRESETS.map((p, idx) => `
        <div class="preset-card" data-preset-idx="${idx}">
          <span class="preset-icon">${p.icon}</span>
          <span class="preset-title">${escapeHtml(p.name)}</span>
          <span class="preset-portion">${escapeHtml(p.serving)}</span>
          <span class="preset-cal">${p.calories} kcal</span>
          <span class="preset-macros-line">P:${p.protein}g C:${p.carbs}g F:${p.fat}g</span>
        </div>
      `).join('');

      presetGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.preset-card');
        if (!card) return;
        const idx = card.getAttribute('data-preset-idx');
        const preset = FOOD_PRESETS[idx];
        if (preset) {
          applyPresetToForm(preset);
          switchToTab('custom');
          showToast(`Selected "${preset.name}"`, 'info');
        }
      });
    }

    function switchToTab(tabName) {
      if (tabName === 'custom') {
        tabCustomBtn.classList.add('active');
        tabPresetsBtn.classList.remove('active');
        foodForm.style.display = 'block';
        presetsPanel.style.display = 'none';
      } else {
        tabPresetsBtn.classList.add('active');
        tabCustomBtn.classList.remove('active');
        foodForm.style.display = 'none';
        presetsPanel.style.display = 'block';
      }
    }

    if (tabCustomBtn) tabCustomBtn.addEventListener('click', () => switchToTab('custom'));
    if (tabPresetsBtn) tabPresetsBtn.addEventListener('click', () => switchToTab('presets'));

    function applyPresetToForm(p) {
      document.getElementById('food-name-input').value = p.name;
      document.getElementById('food-serving-input').value = p.serving;
      document.getElementById('food-calories-input').value = p.calories;
      document.getElementById('food-protein-input').value = p.protein;
      document.getElementById('food-carbs-input').value = p.carbs;
      document.getElementById('food-fat-input').value = p.fat;
      mealSelect.value = p.meal;
      updateMacroEstimate();
    }

    // Macro Calculation Preview
    function updateMacroEstimate() {
      const p = parseFloat(document.getElementById('food-protein-input').value) || 0;
      const c = parseFloat(document.getElementById('food-carbs-input').value) || 0;
      const f = parseFloat(document.getElementById('food-fat-input').value) || 0;
      const est = Math.round(p * 4 + c * 4 + f * 9);
      if (autoCalEstimate) autoCalEstimate.textContent = est;
    }

    ['food-protein-input', 'food-carbs-input', 'food-fat-input'].forEach(id => {
      const input = document.getElementById(id);
      if (input) input.addEventListener('input', updateMacroEstimate);
    });

    if (useMacroCalcBtn) {
      useMacroCalcBtn.addEventListener('click', () => {
        const est = autoCalEstimate ? autoCalEstimate.textContent : '0';
        document.getElementById('food-calories-input').value = est;
        showToast(`Applied ${est} kcal estimate`, 'info');
      });
    }

    // Form Submit
    if (foodForm) {
      foodForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const editId = editIdInput.value;
        const name = document.getElementById('food-name-input').value.trim();
        const meal = mealSelect.value;
        const serving = document.getElementById('food-serving-input').value.trim();
        const calories = parseInt(document.getElementById('food-calories-input').value, 10) || 0;
        const protein = parseFloat(document.getElementById('food-protein-input').value) || 0;
        const carbs = parseFloat(document.getElementById('food-carbs-input').value) || 0;
        const fat = parseFloat(document.getElementById('food-fat-input').value) || 0;

        if (!name) {
          showToast('Please enter a food name', 'danger');
          return;
        }

        const now = new Date();
        const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

        const dayData = getDayData(appState.currentDate);

        if (editId) {
          // Updating existing
          const index = dayData.foods.findIndex(f => f.id === editId);
          if (index !== -1) {
            dayData.foods[index] = {
              ...dayData.foods[index],
              name,
              meal,
              serving,
              calories,
              protein,
              carbs,
              fat
            };
            showToast(`Updated "${name}"`, 'success');
          }
        } else {
          // Creating new
          const newFood = {
            id: 'food_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            name,
            meal,
            serving,
            calories,
            protein,
            carbs,
            fat,
            time: timeStr
          };
          dayData.foods.push(newFood);
          showToast(`Logged "${name}" (${calories} kcal)`, 'success');
        }

        saveToStorage();
        closeModal('food-modal');
        renderAll();
      });
    }

    // Open Add Food
    window.openAddFoodModal = function (prefilledMeal = 'breakfast') {
      editIdInput.value = '';
      if (modalTitle) modalTitle.textContent = 'Log Food Item';
      foodForm.reset();
      mealSelect.value = prefilledMeal;
      switchToTab('custom');
      updateMacroEstimate();
      openModal('food-modal');
    };

    // Open Edit Food
    window.openEditFoodModal = function (foodId) {
      const dayData = getDayData(appState.currentDate);
      const food = (dayData.foods || []).find(f => f.id === foodId);
      if (!food) return;

      editIdInput.value = food.id;
      if (modalTitle) modalTitle.textContent = 'Edit Food Item';
      document.getElementById('food-name-input').value = food.name;
      mealSelect.value = food.meal;
      document.getElementById('food-serving-input').value = food.serving || '';
      document.getElementById('food-calories-input').value = food.calories;
      document.getElementById('food-protein-input').value = food.protein || 0;
      document.getElementById('food-carbs-input').value = food.carbs || 0;
      document.getElementById('food-fat-input').value = food.fat || 0;

      switchToTab('custom');
      updateMacroEstimate();
      openModal('food-modal');
    };

    // Delete Food
    window.deleteFoodItem = function (foodId) {
      const dayData = getDayData(appState.currentDate);
      const food = (dayData.foods || []).find(f => f.id === foodId);
      const foodName = food ? food.name : 'Item';

      dayData.foods = (dayData.foods || []).filter(f => f.id !== foodId);
      saveToStorage();
      renderAll();
      showToast(`Removed "${foodName}"`, 'info');
    };
  }

  // --- EXERCISE MODAL ---
  function setupExerciseModal() {
    const form = document.getElementById('exercise-form');
    const nameInput = document.getElementById('exercise-name-input');
    const durInput = document.getElementById('exercise-duration-input');
    const calInput = document.getElementById('exercise-calories-input');

    // Exercise quick chips
    document.querySelectorAll('.exercise-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        nameInput.value = chip.getAttribute('data-name');
        durInput.value = chip.getAttribute('data-min');
        calInput.value = chip.getAttribute('data-cal');
      });
    });

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const duration = parseInt(durInput.value, 10) || 0;
        const calories = parseInt(calInput.value, 10) || 0;

        if (!name || calories <= 0) {
          showToast('Please specify activity name and calories burned', 'danger');
          return;
        }

        const now = new Date();
        const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

        const dayData = getDayData(appState.currentDate);
        dayData.exercises.push({
          id: 'ex_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          name,
          duration,
          calories,
          time: timeStr
        });

        saveToStorage();
        closeModal('exercise-modal');
        renderAll();
        showToast(`Logged activity: -${calories} kcal`, 'success');
      });
    }

    window.openExerciseModal = function () {
      form.reset();
      openModal('exercise-modal');
    };

    window.deleteExerciseItem = function (exerciseId) {
      const dayData = getDayData(appState.currentDate);
      dayData.exercises = (dayData.exercises || []).filter(e => e.id !== exerciseId);
      saveToStorage();
      renderAll();
      showToast('Removed workout log', 'info');
    };
  }

  // --- GOALS MODAL ---
  function setupGoalsModal() {
    const form = document.getElementById('goals-form');
    const calInput = document.getElementById('goal-calories-input');
    const protInput = document.getElementById('goal-protein-input');
    const carbsInput = document.getElementById('goal-carbs-input');
    const fatInput = document.getElementById('goal-fat-input');
    const waterInput = document.getElementById('goal-water-input');
    const resetBtn = document.getElementById('reset-default-goals-btn');

    function populateGoalsForm() {
      calInput.value = appState.settings.calorieGoal;
      protInput.value = appState.settings.proteinGoal;
      carbsInput.value = appState.settings.carbsGoal;
      fatInput.value = appState.settings.fatGoal;
      waterInput.value = appState.settings.waterGoal;
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        calInput.value = DEFAULT_SETTINGS.calorieGoal;
        protInput.value = DEFAULT_SETTINGS.proteinGoal;
        carbsInput.value = DEFAULT_SETTINGS.carbsGoal;
        fatInput.value = DEFAULT_SETTINGS.fatGoal;
        waterInput.value = DEFAULT_SETTINGS.waterGoal;
        showToast('Reset targets to default values', 'info');
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        appState.settings.calorieGoal = parseInt(calInput.value, 10) || DEFAULT_SETTINGS.calorieGoal;
        appState.settings.proteinGoal = parseInt(protInput.value, 10) || DEFAULT_SETTINGS.proteinGoal;
        appState.settings.carbsGoal = parseInt(carbsInput.value, 10) || DEFAULT_SETTINGS.carbsGoal;
        appState.settings.fatGoal = parseInt(fatInput.value, 10) || DEFAULT_SETTINGS.fatGoal;
        appState.settings.waterGoal = parseInt(waterInput.value, 10) || DEFAULT_SETTINGS.waterGoal;

        saveToStorage();
        closeModal('goals-modal');
        renderAll();
        showToast('Updated daily goals and targets', 'success');
      });
    }

    window.openGoalsModal = function () {
      populateGoalsForm();
      openModal('goals-modal');
    };
  }

  // --- WEBSTORAGE MANAGEMENT (EXPORT, IMPORT, RESET) ---
  function setupDataModal() {
    const daysCountElem = document.getElementById('storage-days-count');
    const foodsCountElem = document.getElementById('storage-foods-count');
    const exportBtn = document.getElementById('export-json-btn');
    const importInput = document.getElementById('import-json-file');
    const triggerImportBtn = document.getElementById('trigger-import-btn');
    const loadSampleBtn = document.getElementById('load-sample-data-btn');
    const clearAllBtn = document.getElementById('clear-all-data-btn');

    function updateStorageStats() {
      const daysKeys = Object.keys(appState.days);
      let totalFoods = 0;
      daysKeys.forEach(k => {
        if (appState.days[k] && appState.days[k].foods) {
          totalFoods += appState.days[k].foods.length;
        }
      });

      if (daysCountElem) daysCountElem.textContent = daysKeys.length.toString();
      if (foodsCountElem) foodsCountElem.textContent = totalFoods.toString();
    }

    // Export JSON
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const payload = {
          app: 'NutriTrack',
          version: '1.0',
          exportedAt: new Date().toISOString(),
          settings: appState.settings,
          days: appState.days
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nutritrack-backup-${formatDateKey(new Date())}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Exported JSON backup file', 'success');
      });
    }

    // Trigger File Input
    if (triggerImportBtn && importInput) {
      triggerImportBtn.addEventListener('click', () => importInput.click());

      importInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const imported = JSON.parse(event.target.result);
            if (imported && imported.days && typeof imported.days === 'object') {
              appState.days = imported.days;
              if (imported.settings) {
                appState.settings = { ...DEFAULT_SETTINGS, ...imported.settings };
              }
              saveToStorage();
              renderAll();
              updateStorageStats();
              showToast('Successfully restored data from backup!', 'success');
              closeModal('data-modal');
            } else {
              showToast('Invalid backup file format', 'danger');
            }
          } catch (err) {
            console.error('Import parse error:', err);
            showToast('Failed to parse JSON file', 'danger');
          }
        };
        reader.readAsText(file);
      });
    }

    // Load Sample Demo Day
    if (loadSampleBtn) {
      loadSampleBtn.addEventListener('click', () => {
        seedSampleData();
        renderAll();
        updateStorageStats();
        showToast('Loaded demo nutrition records', 'success');
        closeModal('data-modal');
      });
    }

    // Wipe All Data
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to wipe all stored logs from WebStorage? This cannot be undone.')) {
          localStorage.removeItem(STORAGE_KEY);
          appState.days = {};
          appState.settings = { ...DEFAULT_SETTINGS };
          saveToStorage();
          renderAll();
          updateStorageStats();
          showToast('Cleared all records from local storage', 'info');
          closeModal('data-modal');
        }
      });
    }

    window.openDataModal = function () {
      updateStorageStats();
      openModal('data-modal');
    };
  }

  // --- EVENT LISTENERS INITIALIZATION ---
  function setupEventListeners() {
    // Header Buttons
    document.getElementById('open-food-modal-btn').addEventListener('click', () => openAddFoodModal('breakfast'));
    document.getElementById('open-goals-btn').addEventListener('click', openGoalsModal);
    document.getElementById('open-data-btn').addEventListener('click', openDataModal);
    document.getElementById('open-exercise-modal-btn').addEventListener('click', openExerciseModal);

    // Date Switcher
    document.getElementById('prev-day-btn').addEventListener('click', () => shiftDate(-1));
    document.getElementById('next-day-btn').addEventListener('click', () => shiftDate(1));
    document.getElementById('today-jump-btn').addEventListener('click', () => {
      appState.currentDate = formatDateKey(new Date());
      renderAll();
    });

    const datePicker = document.getElementById('date-picker-input');
    if (datePicker) {
      datePicker.addEventListener('change', (e) => {
        if (e.target.value) {
          appState.currentDate = e.target.value;
          renderAll();
        }
      });
    }

    // Hydration Buttons
    const modifyWater = (amount) => {
      const dayData = getDayData(appState.currentDate);
      dayData.water = Math.max(0, (dayData.water || 0) + amount);
      saveToStorage();
      renderSummaryCards();
      const sign = amount > 0 ? `+${amount}` : `${amount}`;
      showToast(`${sign} ml water logged`, 'info');
    };

    document.getElementById('water-add-250-btn').addEventListener('click', () => modifyWater(250));
    document.getElementById('water-add-500-btn').addEventListener('click', () => modifyWater(500));
    document.getElementById('water-minus-250-btn').addEventListener('click', () => modifyWater(-250));

    // Meal List Add Button Delegations
    document.querySelectorAll('.add-to-meal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const meal = btn.getAttribute('data-meal');
        openAddFoodModal(meal);
      });
    });

    // Food List Edit & Delete Delegations
    document.getElementById('meals-container').addEventListener('click', (e) => {
      const editBtn = e.target.closest('.food-action-edit');
      if (editBtn) {
        const id = editBtn.getAttribute('data-id');
        openEditFoodModal(id);
        return;
      }

      const delBtn = e.target.closest('.food-action-delete');
      if (delBtn) {
        const id = delBtn.getAttribute('data-id');
        deleteFoodItem(id);
        return;
      }
    });

    // Exercise List Delete Delegations
    document.getElementById('exercise-list-container').addEventListener('click', (e) => {
      const delBtn = e.target.closest('.exercise-del-btn');
      if (delBtn) {
        const id = delBtn.getAttribute('data-id');
        deleteExerciseItem(id);
      }
    });

    // Search and Filter Handling
    const searchInput = document.getElementById('food-search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        appState.searchQuery = e.target.value;
        if (clearSearchBtn) {
          clearSearchBtn.style.display = appState.searchQuery ? 'block' : 'none';
        }
        renderMealsList();
      });
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        appState.searchQuery = '';
        clearSearchBtn.style.display = 'none';
        renderMealsList();
      });
    }

    // Meal Filter Pills
    const filterGroup = document.getElementById('meal-filter-group');
    if (filterGroup) {
      filterGroup.addEventListener('click', (e) => {
        const pill = e.target.closest('.filter-pill');
        if (!pill) return;
        document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        appState.activeMealFilter = pill.getAttribute('data-filter') || 'all';
        renderMealsList();
      });
    }

    // Modal Close Buttons
    document.getElementById('close-food-modal-btn').addEventListener('click', () => closeModal('food-modal'));
    document.getElementById('cancel-food-modal-btn').addEventListener('click', () => closeModal('food-modal'));

    document.getElementById('close-exercise-modal-btn').addEventListener('click', () => closeModal('exercise-modal'));
    document.getElementById('cancel-exercise-modal-btn').addEventListener('click', () => closeModal('exercise-modal'));

    document.getElementById('close-goals-modal-btn').addEventListener('click', () => closeModal('goals-modal'));
    document.getElementById('close-data-modal-btn').addEventListener('click', () => closeModal('data-modal'));

    // Backdrop Click to Close
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal.id);
        }
      });
    });

    // Keyboard Shortcuts (Esc to close)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllModals();
      }
    });
  }

  // Helper Sanitizer
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // --- INITIALIZE APPLICATION ---
  function init() {
    const hasData = loadFromStorage();
    if (!hasData || Object.keys(appState.days).length === 0) {
      seedSampleData();
    }

    setupFoodModal();
    setupExerciseModal();
    setupGoalsModal();
    setupDataModal();
    setupEventListeners();

    renderAll();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
