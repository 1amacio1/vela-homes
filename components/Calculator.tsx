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
  return (
    <section className="section calculator-section" id="calculator">
      <div className="section-top">
        <p className="eyebrow">04 / СТОИМОСТЬ</p>
        <span className="meta">ПОНЯТНЫЙ ОРИЕНТИР ДЛЯ ВАШЕГО ПРОЕКТА</span>
      </div>
      <div className="section-heading">
        <h2>
          Начните с <span className="title-accent">простого расчёта.</span>
        </h2>
        <p>
          Выберите параметры будущего дома.
          <br />
          Мы поможем уточнить детали и бюджет.
        </p>
      </div>
      <div className="calculator">
        <div className="calc-options">
          <div className="area-heading">
            <label htmlFor="area">Площадь дома</label>
            <div>
              <input
                id="area"
                type="number"
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
            onChange={(e) => update("area", Number(e.target.value))}
          />
          <div className="range-labels">
            <span>40 м²</span>
            <span>500 м²</span>
          </div>
          <div className="field-row">
            <label>
              Количество этажей
              <select
                value={value.floors}
                onChange={(e) => update("floors", Number(e.target.value))}
              >
                {[1, 2, 3].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "этаж" : "этажа"}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Материал дома
              <select
                value={value.material}
                onChange={(e) => update("material", e.target.value)}
              >
                {materials.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </label>
          </div>
          <fieldset>
            <legend>Комплектация</legend>
            <div className="packages">
              {packages.map((p) => (
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
                  <span>
                    {p.name}
                    <small>от {money(p.rate)}/м²</small>
                  </span>
                </label>
              ))}
            </div>
            <p className="helper">
              {packages.find((p) => p.id === value.package)?.description}
            </p>
          </fieldset>
          <fieldset>
            <legend>Дом и территория</legend>
            <div className="extras">
              {(
                [
                  ["design", "Дизайн интерьера", "от 3 000 ₽/м²"],
                  ["landscape", "Ландшафтный проект", "от 150 000 ₽"],
                  ["lawn", "Устройство газона", "от 800 ₽/м²"],
                  ["terrace", "Терраса", "индивидуально"],
                  ["lighting", "Освещение участка", "индивидуально"],
                  ["gazebo", "Беседка", "индивидуально"],
                ] as const
              ).map(([key, label, price]) => (
                <label className="check" key={key}>
                  <input
                    type="checkbox"
                    checked={value[key]}
                    onChange={(e) => update(key, e.target.checked)}
                  />
                  <span>
                    {label}
                    <small>{price}</small>
                  </span>
                </label>
              ))}
            </div>
            <div className="field-row compact">
              {value.lawn && (
                <label>
                  Площадь газона, м²
                  <input
                    type="number"
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
              <label>
                Посадка деревьев, шт.
                <input
                  type="number"
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
        <aside className="calc-result">
          <p className="eyebrow">ВАШ БУДУЩИЙ ДОМ</p>
          <h3>
            {value.area} <span>м²</span>
          </h3>
          <p>
            {value.floors} {value.floors === 1 ? "этаж" : "этажа"} ·{" "}
            {value.material}
          </p>
          <div className="estimate-line">
            <span>Строительство</span>
            <span>{money(result.base)}</span>
          </div>
          <div className="estimate-line">
            <span>Дополнительные работы</span>
            <span>{money(result.extras)}</span>
          </div>
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
            className="button"
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
            могут изменить стоимость. Итоговую смету согласуем после обсуждения
            проекта.
          </p>
        </aside>
      </div>
    </section>
  );
}
