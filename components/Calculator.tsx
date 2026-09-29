"use client";
import { DirectionIcon } from "@/components/DirectionIcon";
import { useEffect, useRef, useState } from "react";
import {
  type Calculation,
  estimate,
  materials,
  packages,
  money,
} from "@/lib/calculator";
import { track } from "@/lib/tracking";
import { registerCalculator } from "@/lib/webmcp";

const extras = [
  ["design", "Дизайн интерьера", "от 3 000 ₽/м²"],
  ["landscape", "Ландшафтный проект", "от 150 000 ₽"],
  ["lawn", "Устройство газона", "от 800 ₽/м²"],
  ["terrace", "Терраса", "индивидуально"],
  ["lighting", "Освещение участка", "индивидуально"],
  ["gazebo", "Беседка", "индивидуально"],
] as const;

export default function Calculator({
  value,
  onChange,
  onApply,
}: {
  value: Calculation;
  onChange: (c: Calculation) => void;
  onApply: () => void;
}) {
  const current = useRef(value);
  current.current = value;
  const change = useRef(onChange);
  change.current = onChange;
  useEffect(
    () =>
      registerCalculator(
        () => current.current,
        (c) => change.current(c),
      ),
    [],
  );
  const result = estimate(value),
    changed = useRef(false);
  const [treesDraft, setTreesDraft] = useState(String(value.trees));
  useEffect(() => setTreesDraft(String(value.trees)), [value.trees]);
  function update(k: keyof Calculation, v: unknown) {
    changed.current = true;
    onChange({ ...value, [k]: v });
  }
  useEffect(() => {
    if (!changed.current) return;
    const timer = setTimeout(
      () => track("calculator_change", `${value.area} м² / ${value.package}`),
      1000,
    );
    return () => clearTimeout(timer);
  }, [value]);
  const pct = ((Math.min(value.area, 500) - 40) / 460) * 100;
  const pack = packages.find((p) => p.id === value.package)!;
  return (
    <section className="section calculator-section" id="calculator">
      <div className="section-head" data-reveal>
        <div className="section-index">
          <span>04</span>
          <i />
          <span>Стоимость</span>
        </div>
        <h2>
          Начните
          <br />
          <em>с простого расчёта.</em>
        </h2>
        <p className="lead">
          Выберите параметры будущего дома — стоимость пересчитывается сразу.
          Мы поможем уточнить детали и бюджет.
        </p>
      </div>
      <div className="rates" data-reveal>
        {packages.map((p) => (
          <div key={p.id}>
            <span>{p.name}</span>
            <strong>от {money(p.rate)}</strong>
            <small>за м²</small>
          </div>
        ))}
        <div>
          <span>Дизайн интерьера</span>
          <strong>от 3 000 ₽</strong>
          <small>за м²</small>
        </div>
        <div>
          <span>Ландшафтный проект</span>
          <strong>от 150 000 ₽</strong>
          <small>за проект</small>
        </div>
        <div>
          <span>Устройство газона</span>
          <strong>от 800 ₽</strong>
          <small>за м²</small>
        </div>
      </div>
      <div className="calculator">
        <div className="calc-options" data-reveal>
          <div className="calc-group calc-area">
            <div className="area-heading">
              <label htmlFor="area">Площадь дома</label>
              <div className="area-value">
                <input
                  id="area"
                  type="number"
                  inputMode="numeric"
                  min="40"
                  max="1000"
                  value={value.area}
                  onChange={(e) =>
                    update(
                      "area",
                      Math.min(1000, Math.max(40, Number(e.target.value))),
                    )
                  }
                />
                <span>м²</span>
              </div>
            </div>
            <input
              aria-label="Площадь дома — ползунок"
              className="range"
              type="range"
              min="40"
              max="500"
              step="5"
              value={Math.min(value.area, 500)}
              style={{ "--pct": pct + "%" } as React.CSSProperties}
              onChange={(e) => update("area", Number(e.target.value))}
            />
            <div className="range-labels">
              <span>40 м²</span>
              <span>500 м²</span>
            </div>
          </div>

          <div className="calc-row">
            <fieldset className="calc-group">
              <legend>Количество этажей</legend>
              <div className="segmented">
                {[1, 2, 3].map((n) => (
                  <label
                    key={n}
                    className={value.floors === n ? "selected" : ""}
                  >
                    <input
                      type="radio"
                      name="floors"
                      checked={value.floors === n}
                      onChange={() => update("floors", n)}
                    />
                    {n} {n === 1 ? "этаж" : "этажа"}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="calc-group">
              <legend>Материал дома</legend>
              <div className="chips">
                {materials.map((m) => (
                  <label
                    key={m}
                    className={value.material === m ? "selected" : ""}
                  >
                    <input
                      type="radio"
                      name="material"
                      checked={value.material === m}
                      onChange={() => update("material", m)}
                    />
                    {m}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <fieldset className="calc-group">
            <legend>Комплектация</legend>
            <div className="packages">
              {packages.map((p, i) => (
                <label
                  key={p.id}
                  className={value.package === p.id ? "selected" : ""}
                >
                  <input
                    type="radio"
                    name="package"
                    checked={value.package === p.id}
                    onChange={() => update("package", p.id)}
                  />
                  <span className="package-no">0{i + 1}</span>
                  <span className="package-name">{p.name}</span>
                  <span className="package-rate">от {money(p.rate)}/м²</span>
                  <span className="package-desc">{p.description}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="calc-group">
            <legend>Дом и территория</legend>
            <div className="extras">
              {extras.map(([key, label, price]) => (
                <label className="toggle" key={key}>
                  <input
                    type="checkbox"
                    checked={value[key]}
                    onChange={(e) => update(key, e.target.checked)}
                  />
                  <span className="toggle-box" aria-hidden="true" />
                  <span className="toggle-label">{label}</span>
                  <span className="toggle-price">{price}</span>
                </label>
              ))}
            </div>
            <div className="calc-row compact">
              {value.lawn && (
                <label className="field">
                  Площадь газона, м²
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="10000"
                    value={value.lawnArea}
                    onChange={(e) =>
                      update(
                        "lawnArea",
                        Math.max(0, Math.min(10000, +e.target.value)),
                      )
                    }
                  />
                </label>
              )}
              <label className="field">
                Посадка деревьев, шт.
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="100"
                  value={treesDraft}
                  onFocus={(e) => e.currentTarget.select()}
                  onChange={(e) => {
                    const draft = e.target.value;
                    if (draft === "") {
                      setTreesDraft("");
                      return;
                    }
                    const trees = Math.max(0, Math.min(100, Number(draft)));
                    setTreesDraft(String(trees));
                    update("trees", trees);
                  }}
                  onBlur={() => {
                    if (treesDraft !== "") return;
                    setTreesDraft("0");
                    update("trees", 0);
                  }}
                />
              </label>
            </div>
          </fieldset>
        </div>

        <aside className="calc-result" data-reveal>
          <p className="label">Ваш будущий дом</p>
          <div className="calc-figure">
            <strong>{value.area}</strong>
            <span>м²</span>
          </div>
          <p className="calc-summary">
            {value.floors} {value.floors === 1 ? "этаж" : "этажа"} ·{" "}
            {value.material} · {pack.name}
          </p>
          <dl className="estimate">
            <div className="estimate-line">
              <dt>Строительство</dt>
              <dd>{money(result.base)}</dd>
            </div>
            <div className="estimate-line">
              <dt>Дополнительные работы</dt>
              <dd>{money(result.extras)}</dd>
            </div>
          </dl>
          <div className="estimate-total">
            <span>Предварительная стоимость</span>
            <strong>от {money(result.total)}</strong>
          </div>
          {result.individual.length > 0 && (
            <p className="individual">
              Отдельный расчёт: {result.individual.join(", ").toLowerCase()}.
            </p>
          )}
          <button
            className="button large"
            onClick={() => {
              track("cta_click", "Заявка из калькулятора");
              onApply();
            }}
          >
            Обсудить этот расчёт <DirectionIcon />
          </button>
          <p className="helper">
            Расчёт предварительный. Базовые ставки — ориентир для дома из
            газобетона в 1–2 этажа. Материал, участок, конструктив и регион
            могут изменить стоимость. Окончательную смету согласуем после
            обсуждения проекта.
          </p>
        </aside>
      </div>
    </section>
  );
}
