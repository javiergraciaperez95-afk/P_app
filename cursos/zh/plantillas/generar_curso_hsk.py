#!/usr/bin/env python3
"""Planifica 298 lecciones HSK 2.0 y genera el contenido chino 094–298.

No reemplaza las explicaciones, diálogos ni ejercicios de las lecciones 001–093.
En esas lecciones solo añade el vocabulario oficial que falte y la tabla HSK asignada.
Las lecciones 094–298 que ya creó este generador se regeneran para mantener
sincronizada la asignación léxica con la lista acumulativa de referencia.
"""

from __future__ import annotations

import json
import math
import re
import unicodedata
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
ZH = ROOT / "cursos" / "zh"
LESSONS = ZH / "lessons"
INDEX = ZH / "indice" / "lecciones.json"
CHAPTERS = LESSONS / "capitulos.json"
SOURCE_DATA = ZH / "plantillas" / "vocabulario_hsk_2_0.json"
PLAN = ZH / "plantillas" / "plan_lecciones_hsk_298.json"
TEMPLATE = ZH / "plantillas" / "plantilla_leccion.json"
COURSE_LEVELS = {
    1: (1, 31),
    2: (32, 62),
    3: (63, 93),
    4: (94, 122),
    5: (123, 183),
    6: (184, 298),
}


def tr(es: str, en: str) -> dict[str, str]:
    return {"@es": es, "@en": en}


def english_pattern(pattern: str) -> str:
    """Translate Spanish placeholders used in grammar-pattern labels."""
    for source, target in (
        ("objeto", "object"),
        ("verbo", "verb"),
        ("resultado", "result"),
        ("agente", "agent"),
        ("adjetivo", "adjective"),
        ("acción", "action"),
    ):
        pattern = pattern.replace(source, target)
    return pattern


def fold(text: str) -> str:
    text = unicodedata.normalize("NFD", str(text).lower())
    return "".join(ch for ch in text if unicodedata.category(ch) != "Mn")


def json_read(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def json_write(path: Path, value: Any) -> None:
    indent = 2
    if path in (INDEX, CHAPTERS) or (path.parent == LESSONS and path.stem.isdigit() and int(path.stem) <= 93):
        indent = 1
    if path.exists():
        prefix = path.read_text(encoding="utf-8")[:4096]
        match = re.search(r"\n( +)\"", prefix)
        if match and path not in (INDEX, CHAPTERS) and not (path.parent == LESSONS and path.stem.isdigit() and int(path.stem) <= 93):
            indent = len(match.group(1))
    path.write_text(json.dumps(value, ensure_ascii=False, indent=indent) + "\n", encoding="utf-8")


def gloss_of(entry: dict[str, Any]) -> tuple[str, str, str]:
    es = str(entry.get("glosa_es") or "").strip(" ，。；;\t\n")
    pinyin = str(entry.get("pinyin") or "").strip()
    return es, "", pinyin


POS_ES = {
    "名词": "sustantivo", "动词": "verbo", "形容词": "adjetivo", "副词": "adverbio",
    "介词": "preposición", "助词": "partícula", "助动词": "verbo auxiliar",
    "叹词": "interjección", "量词": "clasificador", "代词": "pronombre",
    "数词": "numeral", "连词": "conjunción",
}


# Temas para clasificar vocabulario. Las listas de niveles 5 y 6 no incluyen glosas,
# así que en esos niveles la clasificación también utiliza componentes chinos reconocibles.
HANZI_RULES: list[tuple[str, tuple[str, ...]]] = [
    ("salud", ("医疗", "医生", "医院", "病", "药", "治疗", "患者", "健康", "症状", "手术", "护理", "心理", "癌", "护士", "康复")),
    ("trabajo", ("职业", "工作", "公司", "企业", "老板", "经理", "管理", "项目", "招聘", "职员", "合同", "业务", "就业", "部门", "办公室", "工资", "工厂", "岗位")),
    ("estudios", ("学校", "学生", "学习", "教育", "考试", "课程", "大学", "本科", "硕士", "博士", "研究", "论文", "知识", "教学", "教材", "科学", "实验", "理论")),
    ("comercio", ("经济", "商业", "市场", "贸易", "价格", "消费", "购物", "商品", "买卖", "银行", "贷款", "保险", "投资", "利润", "成本", "收入", "税", "金融")),
    ("transporte", ("交通", "旅行", "旅游", "飞机", "火车", "汽车", "车站", "机场", "路线", "驾驶", "乘客", "航班", "出发", "到达", "景区", "导游")),
    ("naturaleza", ("环境", "自然", "气候", "天气", "空气", "污染", "生态", "能源", "森林", "植物", "动物", "资源", "地震", "灾害", "海洋", "河流", "农业")),
    ("cultura", ("文化", "艺术", "音乐", "文学", "电影", "戏剧", "历史", "传统", "小说", "诗", "节日", "舞蹈", "绘画", "博物馆", "文明", "表演")),
    ("comunicacion", ("新闻", "媒体", "广播", "电视", "出版", "报纸", "语言", "交流", "信息", "传播", "采访", "报道", "通信", "演讲", "谈话", "广告", "网络")),
    ("relaciones", ("家庭", "家人", "父亲", "母亲", "亲戚", "朋友", "爱情", "夫妻", "婚姻", "感情", "关系", "交往", "邻居", "同事", "同学")),
    ("sociedad", ("社会", "国家", "政府", "法律", "政策", "政治", "民族", "人口", "公共", "法院", "权利", "组织", "社区", "居民", "城市", "乡村", "和平")),
    ("tecnologia", ("技术", "科技", "电脑", "计算机", "电子", "数据", "系统", "程序", "设备", "仪器", "物理", "化学", "生物", "工程", "机器", "自动")),
    ("argumentacion", ("因此", "然而", "尽管", "虽然", "即使", "条件", "原因", "结果", "观点", "态度", "证明", "结论", "影响", "反而", "无论", "只要", "问题", "事实")),
]

SPANISH_RULES: list[tuple[str, tuple[str, ...]]] = [
    ("salud", ("salud", "médic", "enfermed", "hospital", "síntoma", "tratamiento", "medicina", "paciente", "cuerpo", "dolor", "terapia", "psicol")),
    ("trabajo", ("trabajo", "empresa", "oficina", "empleo", "reunión", "profesión", "contrato", "proyecto", "jefe", "salario", "gestión", "negocio", "compañero")),
    ("estudios", ("estudio", "escuela", "estudiante", "universidad", "examen", "clase", "conocimiento", "investigación", "científic", "profesor", "educación", "curso")),
    ("comercio", ("precio", "dinero", "compra", "venta", "comercio", "mercado", "económic", "financier", "banco", "coste", "consumo", "negoci")),
    ("transporte", ("viaje", "tren", "avión", "conduc", "taxi", "hotel", "turismo", "dirección", "estación", "aeropuerto", "ruta", "autobús")),
    ("naturaleza", ("clima", "tiempo", "lluvia", "aire", "medioambiente", "ambiente", "natural", "animal", "planta", "bosque", "energía", "contaminación", "recurso")),
    ("cultura", ("arte", "cultura", "música", "cine", "película", "tradición", "costumbre", "historia", "danza", "novela", "teatro", "literatura")),
    ("comunicacion", ("comunica", "noticia", "periódico", "radio", "entrevista", "mensaje", "información", "informar", "convers", "publicación", "publicar", "anuncio", "teléfono")),
    ("relaciones", ("familia", "padre", "madre", "amigo", "relación", "matrimonio", "amor", "pareja", "compañía", "social", "vecino", "persona")),
    ("sociedad", ("sociedad", "gobierno", "público", "ciudad", "país", "ley", "polític", "organización", "comunidad", "población", "derecho", "servicio")),
    ("tecnologia", ("ordenador", "computadora", "tecnología", "internet", "aparato", "sistema", "ciencia", "máquina", "datos", "digital", "técnic")),
    ("argumentacion", ("causa", "razón", "resultado", "aunque", "sin embargo", "condición", "opinión", "suponer", "según", "mientras", "consecuencia", "conclusión", "demostrar")),
]


def classify_entry(entry: dict[str, Any]) -> str:
    hanzi = entry.get("palabra", "")
    if any(token in hanzi for token in ("家人", "父亲", "母亲", "亲戚", "爱情", "夫妻", "婚姻", "朋友", "感情", "关系")):
        return "relaciones"
    for category, needles in HANZI_RULES:
        if any(needle in hanzi for needle in needles):
            return category
    gloss = fold(str(entry.get("glosa_es") or ""))
    for category, needles in SPANISH_RULES:
        if any(fold(needle) in gloss for needle in needles):
            return category
    return "general"


def classify_lesson(title: str, intro: str = "") -> str:
    text = fold(f"{title} {intro}")
    for category, needles in SPANISH_RULES:
        if any(fold(needle) in text for needle in needles):
            return category
    hanzi = f"{title} {intro}"
    for category, needles in HANZI_RULES:
        if any(needle in hanzi for needle in needles):
            return category
    if any(x in text for x in ("familia", "amigo", "relacion", "persona", "pareja")):
        return "relaciones"
    if any(x in text for x in ("plan", "opinion", "condicion", "causa", "resultado", "argument", "gramatica", "conector")):
        return "argumentacion"
    return "general"


GRAMMAR = [
    {
        "pattern": "虽然……但是……",
        "label_es": "concesión",
        "explanation_es": "虽然 presenta una dificultad o contraste; 但是 introduce lo que ocurre a pesar de ello.",
        "explanation_en": "虽然 introduces a difficulty or contrast; 但是 gives what happens despite it.",
        "zh": "虽然下着雨，但是比赛照常进行。",
        "es": "Aunque está lloviendo, el partido continúa con normalidad.",
        "en": "Although it is raining, the match continues as usual.",
        "blank": "___下着雨，但是比赛照常进行。",
        "answer": "虽然",
        "wrong": "因为",
        "order": "虽然 / 下着雨 / ， / 但是 / 比赛 / 照常 / 进行",
    },
    {
        "pattern": "因为……所以……",
        "label_es": "causa y consecuencia",
        "explanation_es": "因为 introduce la causa y 所以 presenta la consecuencia. En contextos claros se puede omitir uno de los dos conectores.",
        "explanation_en": "因为 introduces the cause and 所以 presents the consequence. In clear contexts, one connector may be omitted.",
        "zh": "因为资料已经准备好了，所以我们可以开始讨论。",
        "es": "Como los materiales ya están preparados, podemos empezar a debatir.",
        "en": "Since the materials are ready, we can start discussing.",
        "blank": "___资料已经准备好了，所以我们可以开始讨论。",
        "answer": "因为",
        "wrong": "虽然",
        "order": "因为 / 资料 / 已经 / 准备好了 / ， / 所以 / 我们 / 可以 / 开始 / 讨论",
    },
    {
        "pattern": "不但……而且……",
        "label_es": "adición enfática",
        "explanation_es": "不但 introduce el primer hecho y 而且 añade un segundo hecho, normalmente más relevante.",
        "explanation_en": "不但 introduces the first fact and 而且 adds a second, often more significant fact.",
        "zh": "这项计划不但节省时间，而且提高了效率。",
        "es": "Este plan no solo ahorra tiempo, sino que además mejora la eficiencia.",
        "en": "This plan not only saves time, but also improves efficiency.",
        "blank": "这项计划___节省时间，而且提高了效率。",
        "answer": "不但",
        "wrong": "除非",
        "order": "这项计划 / 不但 / 节省 / 时间 / ， / 而且 / 提高了 / 效率",
    },
    {
        "pattern": "只要……就……",
        "label_es": "condición suficiente",
        "explanation_es": "只要 presenta la condición mínima suficiente; 就 introduce el resultado que se sigue de ella.",
        "explanation_en": "只要 introduces the minimum sufficient condition; 就 introduces the resulting outcome.",
        "zh": "只要大家按时提交材料，我们就能按计划完成。",
        "es": "Si todos entregan los materiales a tiempo, podremos terminar según lo previsto.",
        "en": "As long as everyone submits the materials on time, we can finish as planned.",
        "blank": "___大家按时提交材料，我们就能按计划完成。",
        "answer": "只要",
        "wrong": "尽管",
        "order": "只要 / 大家 / 按时 / 提交 / 材料 / ， / 我们 / 就 / 能 / 按计划 / 完成",
    },
    {
        "pattern": "即使……也……",
        "label_es": "hipótesis concesiva",
        "explanation_es": "即使 plantea una situación hipotética; 也 indica que el resultado se mantiene incluso en ese caso.",
        "explanation_en": "即使 presents a hypothetical situation; 也 shows the result still holds in that case.",
        "zh": "即使遇到新的问题，我们也会继续寻找办法。",
        "es": "Aunque surjan problemas nuevos, seguiremos buscando una solución.",
        "en": "Even if new problems arise, we will keep looking for a solution.",
        "blank": "___遇到新的问题，我们也会继续寻找办法。",
        "answer": "即使",
        "wrong": "因此",
        "order": "即使 / 遇到 / 新的 / 问题 / ， / 我们 / 也 / 会 / 继续 / 寻找 / 办法",
    },
    {
        "pattern": "随着……",
        "label_es": "cambio progresivo",
        "explanation_es": "随着 presenta un cambio que acompaña a otro proceso: «a medida que…».",
        "explanation_en": "随着 introduces a change that accompanies another process: “as…” or “along with…”.",
        "zh": "随着城市的发展，公共交通变得更加方便。",
        "es": "A medida que la ciudad se desarrolla, el transporte público se vuelve más cómodo.",
        "en": "As the city develops, public transport becomes more convenient.",
        "blank": "___城市的发展，公共交通变得更加方便。",
        "answer": "随着",
        "wrong": "否则",
        "order": "随着 / 城市 / 的 / 发展 / ， / 公共交通 / 变得 / 更加 / 方便",
    },
    {
        "pattern": "不仅……还……",
        "label_es": "adición y ampliación",
        "explanation_es": "不仅 señala un aspecto y 还 agrega otra consecuencia o característica.",
        "explanation_en": "不仅 marks one aspect and 还 adds another consequence or feature.",
        "zh": "阅读不仅能增加知识，还能帮助我们理解不同的观点。",
        "es": "Leer no solo aumenta los conocimientos, también ayuda a comprender distintos puntos de vista.",
        "en": "Reading not only increases knowledge, it also helps us understand different viewpoints.",
        "blank": "阅读___能增加知识，还能帮助我们理解不同的观点。",
        "answer": "不仅",
        "wrong": "除非",
        "order": "阅读 / 不仅 / 能 / 增加 / 知识 / ， / 还 / 能 / 帮助 / 我们 / 理解 / 不同 / 的 / 观点",
    },
    {
        "pattern": "既然……就……",
        "label_es": "premisa conocida y decisión",
        "explanation_es": "既然 presenta un hecho que se da por establecido; 就 introduce la decisión o conclusión coherente con ese hecho.",
        "explanation_en": "既然 states an accepted fact; 就 introduces a decision or conclusion that follows from it.",
        "zh": "既然大家都同意这个方案，我们就开始安排下一步。",
        "es": "Puesto que todos están de acuerdo con esta propuesta, empecemos a organizar el siguiente paso.",
        "en": "Since everyone agrees with this proposal, let us plan the next step.",
        "blank": "___大家都同意这个方案，我们就开始安排下一步。",
        "answer": "既然",
        "wrong": "尽管",
        "order": "既然 / 大家 / 都 / 同意 / 这个 / 方案 / ， / 我们 / 就 / 开始 / 安排 / 下一步",
    },
    {
        "pattern": "一方面……另一方面……",
        "label_es": "dos perspectivas",
        "explanation_es": "一方面 y 另一方面 organizan dos aspectos distintos de un mismo asunto.",
        "explanation_en": "一方面 and 另一方面 organize two distinct aspects of the same issue.",
        "zh": "一方面，网络方便了交流；另一方面，我们也要保护个人信息。",
        "es": "Por un lado, Internet facilita la comunicación; por otro, también debemos proteger los datos personales.",
        "en": "On one hand, the internet makes communication easier; on the other, we must protect personal information.",
        "blank": "___，网络方便了交流；另一方面，我们也要保护个人信息。",
        "answer": "一方面",
        "wrong": "因此",
        "order": "一方面 / ， / 网络 / 方便了 / 交流 / ； / 另一方面 / ， / 我们 / 也 / 要 / 保护 / 个人信息",
    },
    {
        "pattern": "与其……不如……",
        "label_es": "preferencia y recomendación",
        "explanation_es": "与其 presenta una opción menos conveniente; 不如 propone la alternativa preferible.",
        "explanation_en": "与其 presents the less suitable option; 不如 proposes the preferable alternative.",
        "zh": "与其担心结果，不如先把能做的事情做好。",
        "es": "En vez de preocuparte por el resultado, es mejor hacer primero lo que está en tu mano.",
        "en": "Rather than worry about the outcome, it is better to first do what we can.",
        "blank": "___担心结果，不如先把能做的事情做好。",
        "answer": "与其",
        "wrong": "虽然",
        "order": "与其 / 担心 / 结果 / ， / 不如 / 先 / 把 / 能做的 / 事情 / 做好",
    },
    {
        "pattern": "无论……都……",
        "label_es": "alcance general",
        "explanation_es": "无论 introduce varias posibilidades; 都 indica que la afirmación se aplica a todas ellas.",
        "explanation_en": "无论 introduces alternatives; 都 shows that the statement applies to all of them.",
        "zh": "无论选择哪种方法，都要先确认信息是否准确。",
        "es": "Sea cual sea el método elegido, primero hay que comprobar que la información sea exacta.",
        "en": "Whichever method is chosen, first check that the information is accurate.",
        "blank": "___选择哪种方法，都要先确认信息是否准确。",
        "answer": "无论",
        "wrong": "因为",
        "order": "无论 / 选择 / 哪种 / 方法 / ， / 都 / 要 / 先 / 确认 / 信息 / 是否 / 准确",
    },
    {
        "pattern": "不管……都……",
        "label_es": "condición irrelevante",
        "explanation_es": "不管 presenta una circunstancia que no cambia el resultado; 都 mantiene la misma conclusión.",
        "explanation_en": "不管 presents a circumstance that does not change the result; 都 keeps the same conclusion.",
        "zh": "不管任务有多复杂，我们都要一步一步完成。",
        "es": "Por muy compleja que sea la tarea, la completaremos paso a paso.",
        "en": "No matter how complex the task is, we will complete it step by step.",
        "blank": "___任务有多复杂，我们都要一步一步完成。",
        "answer": "不管",
        "wrong": "所以",
        "order": "不管 / 任务 / 有 / 多 / 复杂 / ， / 我们 / 都 / 要 / 一步一步 / 完成",
    },
    {
        "pattern": "除非……否则……",
        "label_es": "condición necesaria",
        "explanation_es": "除非 expresa la condición necesaria; 否则 presenta lo que ocurrirá si no se cumple.",
        "explanation_en": "除非 expresses a necessary condition; 否则 gives what will happen if it is not met.",
        "zh": "除非得到新的消息，否则我们按原计划出发。",
        "es": "A menos que recibamos noticias nuevas, saldremos según el plan original.",
        "en": "Unless we receive new information, we will depart as originally planned.",
        "blank": "___得到新的消息，否则我们按原计划出发。",
        "answer": "除非",
        "wrong": "即使",
        "order": "除非 / 得到 / 新的 / 消息 / ， / 否则 / 我们 / 按 / 原计划 / 出发",
    },
    {
        "pattern": "不但……反而……",
        "label_es": "resultado contrario a lo esperado",
        "explanation_es": "不但 anticipa un efecto y 反而 introduce un resultado inesperado o contrario a la expectativa.",
        "explanation_en": "不但 anticipates an effect and 反而 introduces an unexpected or opposite result.",
        "zh": "这次调整不但没有减少成本，反而提高了效率。",
        "es": "Este ajuste no solo no redujo los costes, sino que además aumentó la eficiencia.",
        "en": "This adjustment did not reduce costs; instead, it improved efficiency.",
        "blank": "这次调整___没有减少成本，反而提高了效率。",
        "answer": "不但",
        "wrong": "无论",
        "order": "这次 / 调整 / 不但 / 没有 / 减少 / 成本 / ， / 反而 / 提高了 / 效率",
    },
    {
        "pattern": "把 + objeto + verbo + resultado",
        "label_es": "oración con 把",
        "explanation_es": "La construcción 把 adelanta el objeto afectado y suele presentar el resultado concreto de la acción.",
        "explanation_en": "The 把 construction places the affected object before the verb and often states the action's result.",
        "zh": "请把讨论的要点记录下来。",
        "es": "Por favor, anota los puntos principales del debate.",
        "en": "Please write down the main points of the discussion.",
        "blank": "请___讨论的要点记录下来。",
        "answer": "把",
        "wrong": "被",
        "order": "请 / 把 / 讨论 / 的 / 要点 / 记录 / 下来",
    },
    {
        "pattern": "被 + agente + verbo",
        "label_es": "voz pasiva",
        "explanation_es": "被 presenta al afectado de la acción antes del agente o del verbo pasivo.",
        "explanation_en": "被 presents the affected participant before the agent or passive verb.",
        "zh": "这份报告已经被专家仔细检查过。",
        "es": "Este informe ya ha sido revisado cuidadosamente por especialistas.",
        "en": "This report has already been carefully reviewed by specialists.",
        "blank": "这份报告已经___专家仔细检查过。",
        "answer": "被",
        "wrong": "把",
        "order": "这份 / 报告 / 已经 / 被 / 专家 / 仔细 / 检查 / 过",
    },
    {
        "pattern": "越来越 + adjetivo",
        "label_es": "cambio gradual",
        "explanation_es": "越来越 indica que una característica aumenta progresivamente con el tiempo.",
        "explanation_en": "越来越 indicates that a quality increases gradually over time.",
        "zh": "随着经验增加，他表达观点时越来越清楚。",
        "es": "A medida que gana experiencia, expresa sus puntos de vista con cada vez más claridad.",
        "en": "As he gains experience, he expresses his views more and more clearly.",
        "blank": "随着经验增加，他表达观点时___清楚。",
        "answer": "越来越",
        "wrong": "忽然",
        "order": "随着 / 经验 / 增加 / ， / 他 / 表达 / 观点 / 时 / 越来越 / 清楚",
    },
    {
        "pattern": "一……就……",
        "label_es": "acciones consecutivas",
        "explanation_es": "一……就…… señala que la segunda acción ocurre inmediatamente después de la primera.",
        "explanation_en": "一……就…… shows that the second action follows immediately after the first.",
        "zh": "我们一收到确认，就通知所有参加者。",
        "es": "En cuanto recibamos la confirmación, avisaremos a todos los participantes.",
        "en": "As soon as we receive confirmation, we will notify all participants.",
        "blank": "我们___收到确认，就通知所有参加者。",
        "answer": "一",
        "wrong": "一边",
        "order": "我们 / 一 / 收到 / 确认 / ， / 就 / 通知 / 所有 / 参加者",
    },
    {
        "pattern": "先……再……最后……",
        "label_es": "secuencia temporal",
        "explanation_es": "先, 再 y 最后 ordenan una explicación o un procedimiento en etapas.",
        "explanation_en": "先, 再, and 最后 order an explanation or procedure into stages.",
        "zh": "先确认资料，再比较结果，最后写出结论。",
        "es": "Primero verifica los datos, después compara los resultados y, por último, escribe la conclusión.",
        "en": "First verify the data, then compare the results, and finally write the conclusion.",
        "blank": "___确认资料，再比较结果，最后写出结论。",
        "answer": "先",
        "wrong": "却",
        "order": "先 / 确认 / 资料 / ， / 再 / 比较 / 结果 / ， / 最后 / 写出 / 结论",
    },
    {
        "pattern": "对……来说……",
        "label_es": "punto de vista",
        "explanation_es": "对……来说 delimita la perspectiva desde la que se evalúa una afirmación.",
        "explanation_en": "对……来说 specifies the perspective from which a statement is evaluated.",
        "zh": "对初学者来说，清楚的例子尤其重要。",
        "es": "Para quienes empiezan, los ejemplos claros son especialmente importantes.",
        "en": "For beginners, clear examples are especially important.",
        "blank": "___初学者来说，清楚的例子尤其重要。",
        "answer": "对",
        "wrong": "从而",
        "order": "对 / 初学者 / 来说 / ， / 清楚 / 的 / 例子 / 尤其 / 重要",
    },
    {
        "pattern": "不仅如此，……",
        "label_es": "continuación del argumento",
        "explanation_es": "不仅如此 recupera una idea previa y anuncia una información adicional.",
        "explanation_en": "不仅如此 refers back to a prior idea and introduces additional information.",
        "zh": "这项服务节省了时间。不仅如此，它还方便了远方的用户。",
        "es": "Este servicio ahorra tiempo. Además, facilita el acceso a usuarios que están lejos.",
        "en": "This service saves time. Moreover, it also helps users who are far away.",
        "blank": "这项服务节省了时间。___，它还方便了远方的用户。",
        "answer": "不仅如此",
        "wrong": "无论如何",
        "order": "这项服务 / 节省了 / 时间 / 。 / 不仅如此 / ， / 它 / 还 / 方便了 / 远方 / 的 / 用户",
    },
    {
        "pattern": "由此可见……",
        "label_es": "conclusión a partir de evidencia",
        "explanation_es": "由此可见 introduce una conclusión que se deriva de la información anterior.",
        "explanation_en": "由此可见 introduces a conclusion derived from the preceding information.",
        "zh": "两次调查都得到了相似的结果，由此可见这个趋势比较稳定。",
        "es": "Las dos encuestas obtuvieron resultados similares; de ello se desprende que la tendencia es bastante estable.",
        "en": "Both surveys produced similar results; this shows that the trend is fairly stable.",
        "blank": "两次调查都得到了相似的结果，___这个趋势比较稳定。",
        "answer": "由此可见",
        "wrong": "除非",
        "order": "两次 / 调查 / 都 / 得到 / 了 / 相似 / 的 / 结果 / ， / 由此可见 / 这个 / 趋势 / 比较 / 稳定",
    },
    {
        "pattern": "据……显示 / 表明……",
        "label_es": "atribuir información a una fuente",
        "explanation_es": "据 identifica la fuente de la información; 显示 o 表明 introduce lo que esa fuente indica.",
        "explanation_en": "据 identifies the information source; 显示 or 表明 introduces what it indicates.",
        "zh": "据调查结果显示，越来越多的人选择公共交通。",
        "es": "Según los resultados de la encuesta, cada vez más personas eligen el transporte público.",
        "en": "According to the survey results, more and more people choose public transport.",
        "blank": "___调查结果显示，越来越多的人选择公共交通。",
        "answer": "据",
        "wrong": "尽管",
        "order": "据 / 调查结果 / 显示 / ， / 越来越多 / 的 / 人 / 选择 / 公共交通",
    },
]


def grammar_for(index: int, level: int) -> dict[str, str]:
    # Avanza de estructuras narrativas a conectores y organización del discurso.
    offset = {4: 0, 5: 3, 6: 8}[level]
    return GRAMMAR[(index + offset) % len(GRAMMAR)]


def make_group(category: str, es: str, zh: str, subs: list[tuple[str, str]]) -> list[dict[str, str]]:
    return [{"tema": category, "grupo_es": es, "grupo_zh": zh, "sub_es": sub_es, "sub_zh": sub_zh} for sub_es, sub_zh in subs]


CURRICULUM: dict[int, list[dict[str, str]]] = {
    4: (
        make_group("vida", "Experiencias personales", "个人经历", [("Relatar cambios y decisiones", "变化与选择")])
        + make_group("relaciones", "Relaciones y convivencia", "人际交往", [("Amistad, apoyo y conflictos", "友谊、帮助与矛盾")])
        + make_group("estudios", "Estudios y proyectos", "学习与计划", [("Formación y proyectos de estudio", "学习与计划")])
        + make_group("trabajo", "Trabajo y organizaciones", "工作与组织", [("Buscar empleo", "求职"), ("Tareas, responsabilidades y reuniones", "工作、责任与会议")])
        + make_group("sociedad", "Servicios y ciudad", "社会服务与城市", [("Trámites, atención y vida urbana", "办事、服务与城市生活")])
        + make_group("comercio", "Compras y consumo", "购物与消费", [("Comparar productos, precio y calidad", "比较商品、价格与质量")])
        + make_group("transporte", "Viajes y transporte", "旅行与交通", [("Organizar un viaje y alojamiento", "安排旅行与住宿"), ("Rutas y experiencias de viaje", "路线与旅行经历")])
        + make_group("comunicacion", "Noticias y comunicación", "新闻与交流", [("Entrevistar, responder y comprender noticias", "采访、回答与理解新闻")])
        + make_group("salud", "Salud y hábitos", "健康与习惯", [("Síntomas y consultas", "症状与看病"), ("Prevención y deporte", "预防与运动")])
        + make_group("naturaleza", "Tiempo y entorno", "天气与环境", [("Clima, estaciones y cuidado del entorno", "天气、季节与环境保护")])
        + make_group("cultura", "Cultura y costumbres", "文化与习俗", [("Celebraciones, arte y ocio", "节日、艺术与休闲")])
        + make_group("tecnologia", "Tecnología cotidiana", "日常科技", [("Comunicación digital", "数字交流")])
        + make_group("argumentacion", "Causa, contraste y condición", "原因、转折与条件", [("Explicar causas y consecuencias", "说明原因与结果"), ("Conceder y contrastar", "让步与转折"), ("Condiciones y propósito", "条件与目的")])
        + make_group("gramatica", "Construir oraciones complejas", "复杂句式", [("Complementos de dirección", "趋向补语"), ("Complementos de resultado", "结果补语"), ("把 para actuar sobre objetos", "把字句"), ("被 para describir acciones recibidas", "被字句"), ("Grado y comparación", "程度与比较"), ("Experiencia y cambio", "经历与变化"), ("Secuenciar un relato", "叙述顺序")])
        + make_group("comunicacion", "Opinión, lectura y escritura", "观点、阅读与写作", [("Expresar opiniones y leer textos informativos", "表达观点与阅读说明文"), ("Redactar un párrafo y repasar para el examen", "写一段话与考试复习")])
        + make_group("examen", "Preparación HSK 4", "HSK四级复习", [("Simulacro integrado de comprensión y expresión", "听说读写综合练习"), ("Repaso final HSK 4", "HSK四级总复习")])
    ),
    5: (
        make_group("vida", "Trayectoria y decisiones", "经历与选择", [("Identidad y biografía", "身份与经历"), ("Cambios de vida", "生活变化"), ("Decisiones personales", "个人选择"), ("Metas y expectativas", "目标与期待"), ("Hábitos y responsabilidades", "习惯与责任"), ("Recuerdos y experiencias", "回忆与经历")])
        + make_group("trabajo", "Profesión y empresa", "职业与企业", [("Trayectoria profesional", "职业经历"), ("Solicitudes y entrevistas", "申请与面试"), ("Equipos y responsabilidades", "团队与职责"), ("Organización de proyectos", "项目管理"), ("Reuniones y negociación", "会议与谈判"), ("Contratos y acuerdos", "合同与协议"), ("Servicios y atención", "服务与接待"), ("Informes de trabajo", "工作报告")])
        + make_group("estudios", "Educación e investigación", "教育与研究", [("Sistemas educativos", "教育制度"), ("Tareas académicas", "学术任务"), ("Métodos de investigación", "研究方法"), ("Fuentes y evidencias", "资料与证据"), ("Teorías y argumentos", "理论与论证"), ("Ciencia aplicada", "应用科学"), ("Resultados de un estudio", "研究结果")])
        + make_group("sociedad", "Sociedad y vida pública", "社会与公共生活", [("Ciudad y comunidad", "城市与社区"), ("Servicios sociales", "社会服务"), ("Normas y derechos", "规则与权利"), ("Política pública", "公共政策"), ("Migración y convivencia", "迁移与共处"), ("Debate público", "公共讨论"), ("Participación ciudadana", "公民参与")])
        + make_group("cultura", "Cultura y comunicación", "文化与交流", [("Viajes y turismo", "旅行与旅游"), ("Costumbres y patrimonio", "习俗与遗产"), ("Literatura y relatos", "文学与故事"), ("Arte y cine", "艺术与电影"), ("Medios de comunicación", "传播媒体"), ("Entrevistas y reportajes", "采访与报道"), ("Expresión cultural", "文化表达")])
        + make_group("salud", "Salud y medioambiente", "健康与环境", [("Atención médica", "医疗服务"), ("Nutrición y hábitos", "营养与习惯"), ("Prevención", "疾病预防"), ("Bienestar psicológico", "心理健康"), ("Protección ambiental", "环境保护"), ("Energía y recursos", "能源与资源"), ("Ciudad sostenible", "可持续城市")])
        + make_group("tecnologia", "Ciencia, innovación y tecnología", "科学、创新与技术", [("Innovación y cambios", "创新与变化"), ("Sistemas y herramientas", "系统与工具"), ("Datos y análisis", "数据与分析"), ("Inventos y descubrimientos", "发明与发现"), ("Métodos científicos", "科学方法"), ("Riesgo y seguridad", "风险与安全"), ("Tecnología del futuro", "未来科技")])
        + make_group("argumentacion", "Argumentar con precisión", "准确论证", [("Causa y consecuencia", "原因与结果"), ("Concesión", "让步关系"), ("Condiciones y supuestos", "条件与假设"), ("Contraste de perspectivas", "观点对比"), ("Secuencia lógica", "逻辑顺序"), ("Evidencia y conclusión", "证据与结论")])
        + make_group("comunicacion", "Lectura, escritura y síntesis", "阅读、写作与总结", [("Párrafos bien cohesionados", "连贯段落"), ("Redactar una opinión", "写观点文章"), ("Resumir una lectura", "概括阅读内容"), ("Citar y reformular", "引用与改写"), ("Comprensión auditiva", "听力理解"), ("Simulacro integrado HSK 5", "HSK五级综合练习")])
    ),
    6: (
        make_group("sociedad", "Sociedad y ciudadanía", "社会与公民", [("Cambios demográficos", "人口变化"), ("Vida urbana", "城市生活"), ("Desigualdad y oportunidades", "差异与机会"), ("Servicios comunitarios", "社区服务"), ("Participación social", "社会参与"), ("Diversidad cultural", "文化多样性"), ("Problemas colectivos", "公共问题"), ("Responsabilidad social", "社会责任"), ("Organizaciones civiles", "社会组织"), ("Debate sobre el bienestar", "民生讨论")])
        + make_group("sociedad", "Gobierno, derecho y administración", "政府、法律与行政", [("Instituciones y gobierno", "机构与政府"), ("Leyes y normas", "法律与规则"), ("Políticas públicas", "公共政策"), ("Justicia y tribunales", "司法与法院"), ("Derechos y obligaciones", "权利与义务"), ("Administración y trámites", "行政与手续"), ("Decisiones colectivas", "集体决策"), ("Conflictos y mediación", "冲突与调解"), ("Gestión de servicios", "服务管理"), ("Evaluar una política", "评估政策")])
        + make_group("comercio", "Economía y actividad empresarial", "经济与企业活动", [("Mercados y tendencias", "市场与趋势"), ("Finanzas personales", "个人财务"), ("Gestión empresarial", "企业管理"), ("Comercio internacional", "国际贸易"), ("Producción e industria", "生产与工业"), ("Contratos y compromisos", "合同与承诺"), ("Empleo y condiciones", "就业与条件"), ("Consumo y publicidad", "消费与广告"), ("Inversión y riesgo", "投资与风险"), ("Analizar resultados económicos", "分析经济结果")])
        + make_group("tecnologia", "Ciencia, investigación y tecnología", "科学、研究与技术", [("Diseñar una investigación", "设计研究"), ("Datos y mediciones", "数据与测量"), ("Experimentos y resultados", "实验与结果"), ("Sistemas tecnológicos", "技术系统"), ("Innovación aplicada", "应用创新"), ("Comunicación digital", "数字交流"), ("Ciencia y sociedad", "科学与社会"), ("Métodos y pruebas", "方法与检验"), ("Explicar un proceso", "说明过程"), ("Valorar una innovación", "评价创新")])
        + make_group("salud", "Salud y psicología", "健康与心理", [("Atención sanitaria", "医疗服务"), ("Enfermedades y tratamientos", "疾病与治疗"), ("Prevención y hábitos", "预防与习惯"), ("Salud mental", "心理健康"), ("Estrés y adaptación", "压力与适应"), ("Envejecimiento y cuidados", "老龄与照护"), ("Evidencia médica", "医学证据"), ("Salud pública", "公共卫生"), ("Bienestar y calidad de vida", "健康与生活质量"), ("Debatir una recomendación", "讨论建议")])
        + make_group("naturaleza", "Medioambiente y geografía", "环境与地理", [("Ecosistemas", "生态系统"), ("Recursos naturales", "自然资源"), ("Cambio climático", "气候变化"), ("Energía y sostenibilidad", "能源与可持续发展"), ("Urbanización", "城市化"), ("Agricultura y territorio", "农业与土地"), ("Desastres naturales", "自然灾害"), ("Geografía humana", "人文地理"), ("Conservación", "自然保护"), ("Proponer soluciones ambientales", "提出环境方案")])
        + make_group("cultura", "Cultura, arte e historia", "文化、艺术与历史", [("Literatura y sociedad", "文学与社会"), ("Teatro y representación", "戏剧与表演"), ("Cine y narrativa", "电影与叙事"), ("Música y tradiciones", "音乐与传统"), ("Patrimonio histórico", "历史遗产"), ("Celebraciones y costumbres", "节日与习俗"), ("Museos y conservación", "博物馆与保护"), ("Creatividad y estética", "创意与审美"), ("Historia y memoria", "历史与记忆"), ("Interpretar una obra", "解读作品")])
        + make_group("estudios", "Educación e investigación académica", "教育与学术研究", [("Itinerarios educativos", "教育路径"), ("Métodos de enseñanza", "教学方法"), ("Teorías y conceptos", "理论与概念"), ("Fuentes académicas", "学术资料"), ("Diseño de un estudio", "研究设计"), ("Presentar resultados", "展示结果"), ("Revisar una hipótesis", "检验假设"), ("Redacción académica", "学术写作"), ("Debate y defensa", "讨论与答辩"), ("Lectura especializada", "专业阅读")])
        + make_group("comunicacion", "Medios, lenguaje y comunicación", "媒体、语言与交流", [("Periodismo y actualidad", "新闻与时事"), ("Radio y televisión", "广播与电视"), ("Medios digitales", "数字媒体"), ("Entrevista y reportaje", "采访与报道"), ("Discurso y retórica", "话语与修辞"), ("Información dudosa", "可疑信息"), ("Debate público", "公共辩论"), ("Exposición oral", "口头表达"), ("Traducción y matices", "翻译与语气"), ("Estilo y registro", "文体与语域")])
        + make_group("relaciones", "Relaciones, ética e identidad", "关系、伦理与身份", [("Resolver desacuerdos", "解决分歧"), ("Acuerdos y compromisos", "协议与承诺"), ("Ética profesional", "职业伦理"), ("Identidad y pertenencia", "身份与归属"), ("Valores y costumbres", "价值与习俗"), ("Relaciones personales", "人际关系"), ("Emociones y actitudes", "情感与态度"), ("Cortesía profesional", "职场礼貌"), ("Responsabilidad individual", "个人责任"), ("Analizar un dilema", "分析难题")])
        + make_group("argumentacion", "Argumentación y pensamiento abstracto", "论证与抽象思维", [("Causa y consecuencia", "原因与结果"), ("Matizar una afirmación", "限定观点"), ("Concesión y contraste", "让步与对比"), ("Supuestos y condiciones", "假设与条件"), ("Implicaciones", "影响与含义"), ("Evidencia y fiabilidad", "证据与可靠性"), ("Comparar explicaciones", "比较解释"), ("Definir conceptos", "界定概念"), ("Inferir y resumir", "推论与总结"), ("Conclusiones prudentes", "谨慎结论")])
        + make_group("lectura", "Precisión léxica y preparación final", "词汇准确性与综合复习", [("Colocaciones y combinaciones", "搭配与组合"), ("Registro y matices", "语域与语气"), ("Estrategias de lectura", "阅读策略"), ("Síntesis y redacción extensa", "综合资料与长篇写作"), ("Simulacro integrado HSK 6", "HSK六级综合练习")])
    ),
}


def lesson_for_new(level: int, number: int, unit_index: int, spec: dict[str, str]) -> dict[str, Any]:
    grammar = grammar_for(unit_index, level)
    es_title = f"{spec['grupo_es']}: {spec['sub_es']}"
    en_title = f"HSK {level} · Unit {number}"
    zh_title = f"{spec['grupo_zh']}·{spec['sub_zh']}"
    objective_es = (
        f"Estudiar el vocabulario asignado a {spec['sub_es'].lower()}, repasar su pronunciación y comprobar los significados "
        f"que ofrece la fuente. Practicar {grammar['label_es']} con la estructura {grammar['pattern']}."
    )
    objective_en = (
        "Study this unit’s assigned vocabulary, review its pronunciation, and check meanings "
        f"where the source provides them. Practise the target structure {english_pattern(grammar['pattern'])} in context."
    )
    return {
        "id": f"{number:03d}",
        "numero": number,
        "nivel_hsk": level,
        "capitulo": level,
        "titulo_zh": zh_title,
        "titulo_es": tr(es_title, en_title),
        "sub_es": spec["sub_es"],
        "sub_zh": spec["sub_zh"],
        "tema": spec["tema"],
        "objetivo": tr(objective_es, objective_en),
        "gramatica": grammar["pattern"],
        "enfoque": grammar,
        "vocabulario_objetivo": [],
        "vocabulario_complementario": [],
    }


def build_lesson_specs() -> dict[int, list[dict[str, Any]]]:
    specs: dict[int, list[dict[str, Any]]] = {1: [], 2: [], 3: []}
    for level, (start, end) in COURSE_LEVELS.items():
        if level >= 4:
            expanded = CURRICULUM[level]
            expected = end - start + 1
            if len(expanded) != expected:
                raise ValueError(f"La planificación HSK {level} tiene {len(expanded)} unidades; se esperaban {expected}.")
            specs[level] = [lesson_for_new(level, start + i, i, item) for i, item in enumerate(expanded)]
            continue

        for number in range(start, end + 1):
            path = LESSONS / f"{number:03d}.json"
            if not path.exists():
                raise FileNotFoundError(f"Falta la lección existente {path}")
            raw = json_read(path)
            title = raw.get("titulo_es", {})
            title_es = title.get("@es", "") if isinstance(title, dict) else str(title)
            title_en = title.get("@en", "") if isinstance(title, dict) else ""
            intro = raw.get("intro", {})
            intro_es = intro.get("@es", "") if isinstance(intro, dict) else str(intro)
            specs[level].append({
                "id": f"{number:03d}",
                "numero": number,
                "nivel_hsk": level,
                "capitulo": level,
                "titulo_zh": raw.get("titulo_zh", ""),
                "titulo_es": title_es,
                "titulo_en": title_en,
                "tema": classify_lesson(title_es, intro_es),
                "objetivo": intro,
                "gramatica": "Repaso integrado y uso en contexto" if number in (31, 62, 93) else "Contenido existente de la lección",
                "vocabulario_objetivo": [],
                "vocabulario_complementario": list(raw.get("palabras", {}).keys()),
            })
    return specs


THEME_ALIASES = {
    "vida": {"vida", "relaciones", "salud", "sociedad", "general", "estudios"},
    "relaciones": {"relaciones", "vida", "sociedad", "general"},
    "estudios": {"estudios", "tecnologia", "comunicacion", "argumentacion", "general", "trabajo"},
    "trabajo": {"trabajo", "comercio", "sociedad", "comunicacion", "general", "estudios"},
    "sociedad": {"sociedad", "trabajo", "relaciones", "comunicacion", "comercio", "general"},
    "comercio": {"comercio", "trabajo", "sociedad", "general"},
    "transporte": {"transporte", "sociedad", "vida", "general", "naturaleza"},
    "comunicacion": {"comunicacion", "cultura", "argumentacion", "sociedad", "general", "estudios"},
    "salud": {"salud", "vida", "naturaleza", "relaciones", "general"},
    "naturaleza": {"naturaleza", "sociedad", "tecnologia", "general", "salud"},
    "cultura": {"cultura", "comunicacion", "sociedad", "general", "estudios"},
    "tecnologia": {"tecnologia", "estudios", "trabajo", "comunicacion", "general"},
    "argumentacion": {"argumentacion", "comunicacion", "estudios", "general", "sociedad"},
    "gramatica": {"gramatica", "argumentacion", "general", "comunicacion"},
    "lectura": {"lectura", "comunicacion", "estudios", "argumentacion", "general"},
    "examen": {"examen", "argumentacion", "lectura", "general", "estudios"},
    "general": {"general", "vida", "relaciones", "argumentacion", "estudios", "sociedad"},
}


def assign_vocabulary(level_specs: list[dict[str, Any]], entries: list[dict[str, Any]]) -> None:
    if not level_specs:
        return
    cap = max(1, math.ceil(len(entries) / len(level_specs)) + 2)
    allocations: dict[str, list[dict[str, Any]]] = {spec["id"]: [] for spec in level_specs}
    for entry in entries:
        category = classify_entry(entry)
        compatible = [
            spec for spec in level_specs
            if spec["tema"] == category or spec["tema"] in THEME_ALIASES.get(category, set())
        ]
        candidates = compatible or level_specs
        under_cap = [spec for spec in candidates if len(allocations[spec["id"]]) < cap]
        if not under_cap:
            under_cap = [spec for spec in level_specs if len(allocations[spec["id"]]) < cap]
        if not under_cap:
            under_cap = level_specs
        chosen = min(under_cap, key=lambda spec: (len(allocations[spec["id"]]), spec["numero"]))
        allocations[chosen["id"]].append(entry)
    # Rellena cualquier unidad vacía moviendo una entrada de una unidad por encima de la media.
    for empty in (spec for spec in level_specs if not allocations[spec["id"]]):
        donors = sorted(level_specs, key=lambda spec: len(allocations[spec["id"]]), reverse=True)
        donor = next((spec for spec in donors if len(allocations[spec["id"]]) > math.floor(len(entries) / len(level_specs))), None)
        if donor:
            allocations[empty["id"]].append(allocations[donor["id"]].pop())
    for spec in level_specs:
        spec["vocabulario_objetivo"] = allocations[spec["id"]]


def table_block(level: int, entries: list[dict[str, Any]]) -> dict[str, Any]:
    rows: list[list[Any]] = []
    for entry in entries:
        es, _, pinyin = gloss_of(entry)
        category = entry.get("categoria_gramatical", "")
        category_es = POS_ES.get(category, category)
        category_display = f"{category_es} ({category})" if category_es else "—"
        rows.append([entry["palabra"], category_display, pinyin or "—", es or "—"])
    note = None
    if level >= 5:
        note = tr(
            "Las listas fuente HSK 5–6 incluyen caracteres y pinyin, pero no glosas españolas. Se conserva esa limitación de la fuente.",
            "The HSK 5–6 source lists provide Chinese words and pinyin but no Spanish glosses. This source limitation is preserved.",
        )
    block = {
        "tipo": "tabla",
        "titulo": tr(f"Vocabulario oficial asignado · HSK {level}", f"Assigned official vocabulary · HSK {level}"),
        "columnas": [tr("Palabra", "Word"), tr("Categoría", "Part of speech"), "Pinyin", tr("Glosa española en la fuente", "Spanish gloss in source")],
        "filas": rows or [["—", "—", "—", "—"]],
    }
    if note:
        block["nota"] = note
    return block


def is_generated_vocabulary_table(block: dict[str, Any]) -> bool:
    title = block.get("titulo", {})
    title_es = title.get("@es", "") if isinstance(title, dict) else str(title)
    return block.get("tipo") == "tabla" and title_es.startswith("Vocabulario oficial asignado · HSK ")


def add_target_words(raw: dict[str, Any], entries: list[dict[str, Any]]) -> None:
    words = raw.setdefault("palabras", {})
    if not isinstance(words, dict):
        words = {}
        raw["palabras"] = words
    for entry in entries:
        if entry.get("grafia_ambigua"):
            words.pop(entry["palabra"], None)
            continue
        es, en, pinyin = gloss_of(entry)
        if not es:
            continue
        current = words.get(entry["palabra"])
        if isinstance(current, dict):
            if es:
                current["es"] = es
            if en:
                current.setdefault("en", en)
            if pinyin:
                current["pron"] = pinyin
        elif current is None:
            item: dict[str, str] = {"es": es}
            if en:
                item["en"] = en
            if pinyin:
                item["pron"] = pinyin
            words[entry["palabra"]] = item
    raw["bloques"] = [b for b in raw.get("bloques", []) if not is_generated_vocabulary_table(b)]
    # Keep the official word list near the beginning, where learners can use it
    # while reading and doing the exercises.
    insert_at = next((i + 1 for i, b in enumerate(raw["bloques"]) if b.get("tipo") == "explicacion"), 0)
    raw["bloques"].insert(insert_at, table_block(raw.get("capitulo", 1), entries))


TOPIC_DIALOGUE_PROMPTS = {
    "vida": ("Al hablar de «{topic_es}», ¿qué decisión te parece más importante?", "谈到「{topic_zh}」，你觉得哪一个选择最重要？", "Thinking about personal experiences, which choice seems most important?", "Diálogo: contar una decisión", "Dialogue: discussing a decision"),
    "relaciones": ("Cuando surge un desacuerdo sobre «{topic_es}», ¿cómo prefieres resolverlo?", "遇到跟「{topic_zh}」有关的分歧时，你通常怎么处理？", "When a disagreement comes up, how do you prefer to resolve it?", "Diálogo: buscar un acuerdo", "Dialogue: finding common ground"),
    "estudios": ("En un proyecto sobre «{topic_es}», ¿qué conviene preparar primero?", "做「{topic_zh}」相关的项目时，你觉得应该先准备什么？", "For a project on this subject, what should we prepare first?", "Diálogo: organizar un proyecto", "Dialogue: planning a project"),
    "trabajo": ("Si aparece un problema relacionado con «{topic_es}», ¿con quién hablarías primero?", "工作中遇到「{topic_zh}」的问题，你会先跟谁商量？", "If this issue came up at work, who would you speak to first?", "Diálogo: coordinar en el trabajo", "Dialogue: coordinating at work"),
    "sociedad": ("Al tratar «{topic_es}», ¿qué información necesita conocer primero la comunidad?", "讨论「{topic_zh}」时，社区最需要先了解什么？", "When discussing this public issue, what does the community need to know first?", "Diálogo: plantear una necesidad pública", "Dialogue: discussing a public need"),
    "comercio": ("Al comparar productos, ¿qué criterio aplicarías además del precio y la calidad?", "比较商品时，除了价格和质量，你还会根据什么来判断？", "When comparing products, what would you consider besides price and quality?", "Diálogo: comparar opciones", "Dialogue: comparing options"),
    "transporte": ("Al organizar «{topic_es}», ¿qué detalle suele ser fácil pasar por alto?", "安排「{topic_zh}」时，什么细节最容易被忽略？", "When planning this trip, what detail is easy to overlook?", "Diálogo: preparar un viaje", "Dialogue: planning a trip"),
    "comunicacion": ("Al leer una noticia sobre «{topic_es}», ¿qué comprobarías primero?", "看到关于「{topic_zh}」的消息，你会先核实什么？", "When you read a report on this subject, what would you check first?", "Diálogo: comprobar una noticia", "Dialogue: checking a news story"),
    "salud": ("Para mejorar «{topic_es}», ¿por qué hábito te parece mejor empezar?", "想改善「{topic_zh}」，你觉得可以从什么习惯开始？", "To improve this aspect of health, which habit would you start with?", "Diálogo: hablar de salud", "Dialogue: talking about health"),
    "naturaleza": ("Ante «{topic_es}», ¿qué pueden hacer las personas y qué puede hacer la comunidad?", "面对「{topic_zh}」，个人和社区分别能做什么？", "In response to this environmental issue, what can individuals and the community do?", "Diálogo: proponer medidas ambientales", "Dialogue: suggesting environmental measures"),
    "cultura": ("Al presentar «{topic_es}», ¿cómo ayudarías al público a entender su contexto?", "介绍「{topic_zh}」时，怎样帮助观众了解它的背景？", "When presenting this cultural subject, how would you help the audience understand its context?", "Diálogo: preparar una presentación cultural", "Dialogue: preparing a cultural presentation"),
    "tecnologia": ("Al usar «{topic_es}», ¿cómo se pueden equilibrar la comodidad y la seguridad?", "使用「{topic_zh}」时，怎样兼顾方便和安全？", "When using this technology, how can convenience and security be balanced?", "Diálogo: hablar de tecnología", "Dialogue: discussing technology"),
    "argumentacion": ("Sobre «{topic_es}», ¿qué tipo de prueba te parece más convincente?", "关于「{topic_zh}」，你觉得哪种证据最有说服力？", "On this issue, what kind of evidence seems most convincing?", "Diálogo: evaluar argumentos", "Dialogue: evaluating arguments"),
    "gramatica": ("Al estudiar «{topic_es}», ¿qué aspecto suele causar más confusión?", "学习「{topic_zh}」时，哪一点最容易混淆？", "When studying this structure, which part is easiest to confuse?", "Diálogo: aclarar una estructura", "Dialogue: clarifying a structure"),
    "lectura": ("En un texto sobre «{topic_es}», ¿cómo identificarías la idea principal?", "读到关于「{topic_zh}」的文章时，你怎样找出中心意思？", "In a text on this subject, how would you identify the main idea?", "Diálogo: comentar una lectura", "Dialogue: discussing a reading"),
    "examen": ("Al repasar «{topic_es}», ¿qué tipo de práctica harías primero?", "复习「{topic_zh}」时，你打算先做哪种练习？", "When reviewing this material, what kind of practice would you do first?", "Diálogo: organizar el repaso", "Dialogue: planning a review"),
}

DIALOGUE_CONTINUATIONS = {
    4: [
        [("我觉得先了解实际情况比较好。", "Creo que es mejor empezar por conocer la situación concreta.", "I think it is best to understand the situation first."), ("你能举一个例子吗？", "¿Puedes poner un ejemplo?", "Can you give an example?"), ("可以，我们先从身边的事情说起。", "Sí; podemos empezar por algo cercano.", "Sure. We can start with something familiar.")],
        [("我想先听听不同人的看法。", "Primero quiero escuchar distintos puntos de vista.", "I would like to hear different points of view first."), ("如果大家的意见不一样呢？", "¿Y si las opiniones son distintas?", "What if people disagree?"), ("我们可以把理由写下来，再一起讨论。", "Podemos anotar los motivos y comentarlos juntos.", "We can write down the reasons and discuss them together.")],
        [("我们可以先做一个简单的计划。", "Podemos empezar con un plan sencillo.", "We can start with a simple plan."), ("要是中间出了问题怎么办？", "¿Y si surge un problema por el camino?", "What should we do if a problem comes up?"), ("到时候再调整，先把眼前的事情做好。", "Lo ajustaremos si hace falta; primero hagamos bien lo que tenemos delante.", "We can adjust it then; for now, let’s handle the immediate task well.")],
    ],
    5: [
        [("我查了几份材料，发现不同来源的说法并不完全一样。", "He consultado varios materiales y he visto que las fuentes no coinciden del todo.", "I checked several sources and found that their accounts do not fully agree."), ("你打算怎样核实？", "¿Cómo piensas comprobarlo?", "How do you plan to verify them?"), ("我会先比较出处，再看论据是否一致。", "Primero compararé la procedencia y después comprobaré si los argumentos coinciden.", "I will compare the sources first, then check whether their evidence agrees."), ("如果核实后仍有差异呢？", "¿Y si las diferencias continúan después de comprobarlas?", "What if the differences remain after verification?"), ("那就说明不同观点，并把证据的局限写清楚。", "Entonces explicaré las distintas posturas y las limitaciones de las pruebas.", "Then I will explain the different views and the limits of the evidence.")],
        [("我把这个问题分成了几个方面，也整理了各自的原因。", "He dividido el problema en varios aspectos y he ordenado las causas de cada uno.", "I divided the issue into several parts and organized the causes of each one."), ("你觉得哪个方面更重要？", "¿Qué aspecto te parece más importante?", "Which aspect seems most important to you?"), ("其实，我们应该先比较这两个方面，再选择解决办法。", "En realidad, conviene comparar ambos aspectos antes de elegir una solución.", "In fact, we should compare the two aspects before choosing a solution."), ("你会根据什么标准来比较？", "¿Con qué criterio los compararías?", "What criteria would you use to compare them?"), ("先看实际效果，再考虑成本和可能的影响。", "Primero miraría los resultados y después el coste y las posibles consecuencias.", "I would look at the practical results first, then the cost and possible effects.")],
        [("我认为这个办法可行，不过还需要考虑具体条件。", "Creo que esta solución puede funcionar, aunque debemos tener en cuenta las condiciones concretas.", "I think this approach could work, though we still need to consider the specific conditions."), ("你最担心哪一部分？", "¿Qué parte te preocupa más?", "Which part concerns you most?"), ("如果时间不够，原来的安排可能就不合适。", "Si falta tiempo, quizá el plan inicial no sea adecuado.", "If time is short, the original plan may not be suitable."), ("那我们能不能准备一个替代方案？", "¿Podemos preparar entonces una alternativa?", "Could we prepare an alternative, then?"), ("可以，同时说明每种选择的利弊。", "Sí; también explicaremos las ventajas y desventajas de cada opción.", "Yes. We can also explain the advantages and drawbacks of each option.")],
    ],
    6: [
        [("目前的材料支持一个初步判断，但还不足以证明因果关系。", "Los materiales permiten una conclusión provisional, pero no bastan para demostrar una relación causal.", "The material supports a preliminary judgment, but it does not prove causation."), ("还需要哪些补充信息？", "¿Qué información adicional haría falta?", "What additional information would we need?"), ("需要扩大样本，并比较不同群体的处境。", "Habría que ampliar la muestra y comparar la situación de distintos grupos.", "We would need a larger sample and compare different groups' circumstances."), ("如果新材料与原来的结论相反呢？", "¿Y si los nuevos materiales contradicen la conclusión inicial?", "What if the new material contradicts the initial conclusion?"), ("那就应修正判断，并说明证据的适用范围。", "Entonces habría que revisar la conclusión y explicar el alcance de las pruebas.", "Then we should revise the judgment and explain the scope of the evidence.")],
        [("我倾向于从两个角度分析，不过两者的依据并不相同。", "Me inclino por analizarlo desde dos perspectivas, aunque sus fundamentos no son iguales.", "I would analyze it from two perspectives, though they rest on different grounds."), ("哪些证据支持这两种观点？", "¿Qué datos respaldan cada postura?", "What evidence supports each position?"), ("有些数据能说明趋势，却不能代表所有情况。", "Algunos datos muestran una tendencia, pero no representan todos los casos.", "Some data point to a trend, but they do not represent every case."), ("那么结论应该怎样表述？", "¿Cómo deberíamos formular la conclusión, entonces?", "How should we frame the conclusion, then?"), ("应说明目前能确认什么，也要指出仍待验证的部分。", "Conviene decir qué podemos confirmar y señalar qué queda por verificar.", "We should state what can be confirmed and identify what still needs verification.")],
        [("这个方案可能解决眼前的问题，却也会带来新的影响。", "Esta propuesta puede resolver el problema inmediato, aunque también podría generar otros efectos.", "This proposal may solve the immediate problem, but it could also have other effects."), ("怎样区分直接影响和间接影响？", "¿Cómo distinguirías los efectos directos de los secundarios?", "How would you distinguish direct from secondary effects?"), ("先观察短期结果，再跟踪后续变化。", "Primero observaría los resultados a corto plazo y después seguiría los cambios posteriores.", "I would observe short-term results first, then track later changes."), ("如果结果因情况而异呢？", "¿Y si los resultados varían según el contexto?", "What if the results vary by context?"), ("就要限定结论的范围，不能把个别情况说成普遍规律。", "Habría que limitar el alcance de la conclusión y no presentar un caso particular como regla general.", "We would need to limit the conclusion and avoid treating one case as a general rule.")],
    ],
}

READING_CORE = {
    "vida": [("谈到「{topic_zh}」，每个人的经历和选择都不一样。", "En «{topic_es}», cada persona vive experiencias distintas y toma sus propias decisiones.", "People have different experiences and make different choices in this area."), ("回顾一段经历时，既要看当时的条件，也要看后来作出的决定。", "Al recordar una experiencia, conviene considerar tanto las circunstancias como las decisiones posteriores.", "Looking back means considering both the circumstances and the choices made later.")],
    "relaciones": [("处理「{topic_zh}」相关的分歧时，先听完对方的想法很重要。", "Al abordar desacuerdos relacionados con «{topic_es}», conviene escuchar primero a la otra persona.", "When dealing with disagreements in this area, it helps to hear the other person out first."), ("表达自己的需要，也要尊重彼此的界限。", "Expresar las propias necesidades también exige respetar los límites de los demás.", "Expressing your own needs also means respecting other people's boundaries.")],
    "estudios": [("研究「{topic_zh}」时，先提出清楚的问题，再选择资料和方法。", "Para estudiar «{topic_es}», primero hay que plantear una pregunta clara y después elegir fuentes y métodos.", "To study this subject, start with a clear question and then choose sources and methods."), ("比较不同材料之后，结论才有充分的依据。", "Comparar distintos materiales permite fundamentar mejor las conclusiones.", "Comparing different sources gives a conclusion a stronger basis.")],
    "trabajo": [("处理工作中的「{topic_zh}」，需要明确分工和时间安排。", "Abordar «{topic_es}» en el trabajo exige aclarar las responsabilidades y los plazos.", "Handling this issue at work requires clear responsibilities and deadlines."), ("遇到变化时，及时沟通通常比等到最后补救更有效。", "Cuando cambian las circunstancias, comunicarse a tiempo suele ser más eficaz que improvisar al final.", "When circumstances change, timely communication is usually more effective than a last-minute fix.")],
    "sociedad": [("改善「{topic_zh}」相关的公共服务，首先要了解居民的实际需要。", "Para mejorar los servicios públicos relacionados con «{topic_es}», primero hay que conocer las necesidades de la comunidad.", "Improving public services in this area starts with understanding residents' needs."), ("收集意见之后，应说明如何处理，并让结果可以查询。", "Tras recoger opiniones, conviene explicar cómo se han atendido y dónde consultar los resultados.", "After collecting feedback, explain how it was handled and where the results can be found.")],
    "comercio": [("比较商品时，价格只是一个标准。", "Al comparar productos, el precio es solo uno de los criterios.", "Price is only one criterion when comparing products."), ("还要核对质量、使用条件和售后服务，才能判断它是否真正合适。", "También hay que comprobar la calidad, las condiciones de uso y el servicio posventa para decidir si conviene.", "You also need to check quality, terms of use, and after-sales service to decide whether a product is suitable.")],
    "transporte": [("安排「{topic_zh}」相关的行程时，要同时考虑路线、交通和住宿。", "Al organizar «{topic_es}», hay que tener en cuenta la ruta, el transporte y el alojamiento.", "Planning this trip means considering the route, transport, and accommodation."), ("提前确认信息，可以减少临时改变计划带来的麻烦。", "Confirmar la información con antelación ayuda a evitar problemas cuando hay que cambiar los planes.", "Checking details in advance can reduce the trouble caused by last-minute changes.")],
    "comunicacion": [("关于「{topic_zh}」的消息传播很快，但传播速度不等于准确。", "Las noticias sobre «{topic_es}» pueden difundirse rápido, pero la rapidez no garantiza que sean exactas.", "News on this subject can spread quickly, but speed does not guarantee accuracy."), ("判断消息是否可靠时，应核实原始来源，并比较独立报道。", "Para evaluar su fiabilidad, hay que comprobar la fuente original y comparar coberturas independientes.", "To assess reliability, check the original source and compare independent reports.")],
    "salud": [("改善「{topic_zh}」要结合个人情况，不能照搬别人的做法。", "Para mejorar «{topic_es}», hay que tener en cuenta la situación personal y no copiar sin más lo que hacen otros.", "Improving this aspect of health depends on the individual; other people's routines may not fit."), ("如果出现明显或持续的症状，应及时向专业人员求助。", "Si aparecen síntomas intensos o persistentes, conviene consultar a un profesional.", "If symptoms are serious or persist, seek help from a professional.")],
    "naturaleza": [("应对「{topic_zh}」需要长期措施，也需要社区参与。", "Responder a «{topic_es}» requiere medidas a largo plazo y la participación de la comunidad.", "Addressing this environmental issue requires long-term measures and community participation."), ("持续记录变化，才能判断哪些做法有效，哪些还需要调整。", "Registrar los cambios de forma continuada permite evaluar qué medidas funcionan y cuáles hay que ajustar.", "Tracking changes over time helps show which measures work and which need adjustment.")],
    "cultura": [("了解「{topic_zh}」不只是记住名称和年代。", "Conocer «{topic_es}» no consiste solo en memorizar nombres y fechas.", "Understanding this cultural subject involves more than remembering names and dates."), ("还要了解它与当时社会生活的联系，并比较不同的解释。", "También hay que relacionarlo con la vida de su época y comparar distintas interpretaciones.", "It also means seeing how it relates to life at the time and comparing different interpretations.")],
    "tecnologia": [("数字工具让「{topic_zh}」相关的信息更容易获得。", "Las herramientas digitales facilitan el acceso a la información sobre «{topic_es}».", "Digital tools make information on this subject easier to access."), ("使用时仍要考虑隐私和安全，例如检查权限、核实链接。", "Aun así, hay que proteger la privacidad y la seguridad, por ejemplo revisando los permisos y los enlaces.", "Privacy and security still matter, so check permissions and verify links.")],
    "argumentacion": [("讨论「{topic_zh}」时，要区分事实、推论和个人立场。", "Al debatir «{topic_es}», hay que distinguir los hechos, las inferencias y las opiniones personales.", "When discussing this issue, distinguish facts, inferences, and personal positions."), ("说明证据的来源并回应反例，结论才更有说服力。", "Explicar de dónde proceden las pruebas y responder a los contraejemplos fortalece la conclusión.", "Explaining the source of evidence and addressing counterexamples makes a conclusion more convincing.")],
    "gramatica": [("学习「{topic_zh}」时，不要只背结构形式。", "Al estudiar «{topic_es}», no basta con memorizar la forma.", "When studying this structure, memorizing its form is not enough."), ("比较语境、语序和语气，才能判断表达是否合适。", "Comparar el contexto, el orden y el tono ayuda a decidir si una expresión es adecuada.", "Comparing context, word order, and tone helps you decide whether an expression fits.")],
    "lectura": [("阅读关于「{topic_zh}」的文章时，可以先找作者的中心观点。", "Al leer sobre «{topic_es}», primero conviene localizar la idea central del autor.", "When reading about this subject, first identify the author's main point."), ("接着看例子怎样支持观点，最后用自己的话概括。", "Después, observa cómo los ejemplos apoyan la idea y resúmela con tus propias palabras.", "Then see how the examples support it and summarize the text in your own words.")],
    "examen": [("复习「{topic_zh}」时，先了解题型，再按计划练习。", "Para repasar «{topic_es}», primero conviene conocer el tipo de ejercicio y después practicar con un plan.", "To review this material, learn the task format first and then practice according to a plan."), ("做完练习后，分析错误原因比重复同一类题更有效。", "Después, analizar por qué te has equivocado suele ser más útil que repetir el mismo tipo de ejercicio.", "After an exercise, analyzing mistakes is usually more useful than repeating the same task type.")],
}

READING_LEVEL_EXTENSION = {
    4: [
        [("先把问题说清楚，再举一个例子，最后说明自己的想法。", "Primero plantea el problema, luego da un ejemplo y termina explicando tu opinión.", "State the problem, give an example, and then explain your view.")],
        [("比较几种办法时，可以先说明各自的优点和不足。", "Al comparar varias opciones, empieza por explicar sus ventajas y desventajas.", "When comparing options, start by explaining their advantages and drawbacks.")],
        [("如果条件发生变化，原来的决定也可以重新考虑。", "Si cambian las circunstancias, también se puede reconsiderar la decisión inicial.", "If circumstances change, the original decision can be reconsidered.")],
    ],
    5: [
        [("如果只凭个人印象，容易忽略其他情况；因此要核对材料，并说明判断依据。", "Si uno se basa solo en impresiones, puede pasar por alto otros casos; por eso hay que contrastar los materiales y explicar el criterio.", "Relying on impressions alone can overlook other cases, so check the sources and explain your reasoning."), ("组织短文时，可以先提出观点，再用事实或例子支持它。", "En un texto breve, presenta primero la idea y apóyala después con hechos o ejemplos.", "In a short text, state your view first and then support it with facts or examples.")],
        [("不同来源有时会强调问题的不同方面，比较它们有助于发现遗漏。", "A veces distintas fuentes destacan aspectos diferentes; compararlas ayuda a detectar lo que falta.", "Different sources may emphasize different aspects, and comparing them can reveal omissions."), ("写作时要解释这些材料如何支持主要观点。", "Al escribir, explica cómo esos materiales respaldan la idea principal.", "In your writing, explain how the sources support your main point.")],
        [("提出解决办法时，还要考虑它会影响哪些人以及需要哪些资源。", "Al proponer una solución, considera también a quién afecta y qué recursos exige.", "When proposing a solution, also consider whom it affects and what resources it requires."), ("清楚的结论要回应问题，并以具体细节为依据。", "Una conclusión clara responde al problema y se apoya en detalles concretos.", "A clear conclusion addresses the problem and rests on specific details.")],
    ],
    6: [
        [("分析时应区分可以观察到的事实与个人解释，也要比较不同立场所依据的材料。", "Al analizar, distingue los hechos observables de las interpretaciones y compara las fuentes que respaldan cada postura.", "In an analysis, distinguish observable facts from interpretations and compare the sources behind each position."), ("即使材料呈现相似趋势，也不能在缺乏证据时直接断定因果关系。", "Aunque los materiales muestren tendencias parecidas, no se debe afirmar una relación causal sin pruebas suficientes.", "Even if sources show similar trends, do not infer causation without enough evidence."), ("结尾应概括主要结论，同时说明证据的局限和结论适用的范围。", "La conclusión debe resumir la idea principal y señalar los límites de las pruebas y el alcance de lo que se afirma.", "A conclusion should summarize the main point and state the limits of the evidence and the scope of the claim.")],
        [("评估一种方案时，应同时考虑短期效果、长期影响和执行成本。", "Al evaluar una propuesta, hay que considerar sus efectos inmediatos, sus consecuencias a largo plazo y el coste de aplicarla.", "When evaluating a proposal, consider its immediate effects, long-term consequences, and implementation costs."), ("若结果与预期不同，就要检查哪些条件没有得到充分考虑。", "Si los resultados difieren de lo esperado, revisa qué condiciones no se tuvieron suficientemente en cuenta.", "If the results differ from expectations, examine which conditions were not fully considered."), ("因此，结论应说明方案在哪些条件下才适用。", "Por eso, la conclusión debe aclarar en qué condiciones sería válida la propuesta.", "The conclusion should therefore state the conditions under which the proposal would apply.")],
        [("不同群体可能从同一变化中得到不同结果，所以不能只听一种声音。", "Distintos grupos pueden verse afectados de manera diferente por un mismo cambio, así que no basta con escuchar una sola voz.", "Different groups may experience the same change differently, so one perspective is not enough."), ("比较各方的经历与证据，有助于解释各方结论为何不同。", "Comparar las experiencias y las pruebas de cada parte ayuda a explicar por qué sus conclusiones difieren.", "Comparing each group's experience and evidence helps explain why their conclusions differ."), ("如果仍有疑问，应当承认，而不是把它们隐藏起来。", "Si aún quedan dudas, conviene reconocerlas en lugar de ocultarlas.", "If uncertainty remains, acknowledge it instead of concealing it.")],
    ],
}

READING_SUMMARIES = {
    "vida": "回顾个人经历时，应结合当时的条件和后来的选择，不能只看单一结果。",
    "relaciones": "处理关系中的分歧需要倾听并尊重界限，再通过沟通寻找合适的办法。",
    "estudios": "研究项目应从明确问题开始，比较不同资料后再形成有依据的结论。",
    "trabajo": "清楚分工、及时沟通并按情况调整计划，有助于减少工作中的误解和延误。",
    "sociedad": "改进公共服务要了解居民的需要，说明意见如何处理，并公开结果。",
    "comercio": "选择商品时要综合比较价格、质量、使用条件和售后服务。",
    "transporte": "安排出行要兼顾路线、交通和住宿，并提前核实信息以减少临时变化。",
    "comunicacion": "判断消息是否可靠要核实原始来源、比较独立报道，不能把传播速度当作准确性。",
    "salud": "健康建议应结合个人情况，出现明显或持续的症状时要及时寻求专业帮助。",
    "naturaleza": "应对环境问题需要长期措施和社区参与，还要持续记录变化并评估效果。",
    "cultura": "理解文化主题要结合历史背景和社会生活，并比较不同的解释。",
    "tecnologia": "使用数字工具时要兼顾便利与隐私安全，并检查权限和信息来源。",
    "argumentacion": "可靠论证要区分事实、推论和立场，说明证据来源并回应反例。",
    "gramatica": "理解语法结构要结合语境比较语序和语气，再判断表达是否自然合适。",
    "lectura": "理解文章要先找中心观点，再看例证如何支持它，并用自己的话概括。",
    "examen": "有效备考要熟悉题型、按计划练习并分析错误原因，而不只是重复同类题。",
}


def contextual_study_content(spec: dict[str, Any]) -> dict[str, Any]:
    level = spec["nivel_hsk"]
    number = spec["numero"]
    category = spec.get("tema", "argumentacion")
    prompt_es, prompt_zh, prompt_en, dialogue_title_es, dialogue_title_en = TOPIC_DIALOGUE_PROMPTS.get(
        category, TOPIC_DIALOGUE_PROMPTS["argumentacion"]
    )
    topic_es = spec["sub_es"]
    topic_zh = spec["sub_zh"]
    opening = (prompt_zh.format(topic_zh=topic_zh), prompt_es.format(topic_es=topic_es), prompt_en)
    continuation = DIALOGUE_CONTINUATIONS[level][number % 3]
    dialogue = [
        {"quien": "林娜" if i % 2 == 0 else "王明", "zh": line[0], "es": line[1], "en": line[2]}
        for i, line in enumerate([opening, *continuation])
    ]
    reading_core = READING_CORE.get(category, READING_CORE["argumentacion"])
    reading_lines = [
        (zh.format(topic_zh=topic_zh), es.format(topic_es=topic_es), en)
        for zh, es, en in reading_core
    ]
    reading_lines.extend(READING_LEVEL_EXTENSION[level][number % 3])
    reading = [{"zh": zh, "es": es, "en": en} for zh, es, en in reading_lines]
    return {
        "dialogue_title": tr(dialogue_title_es, dialogue_title_en),
        "dialogue": dialogue,
        "reading_title": tr("Lectura: " + dialogue_title_es.split(": ", 1)[-1], "Reading: " + dialogue_title_en.split(": ", 1)[-1]),
        "reading": reading,
        "summary": READING_SUMMARIES.get(category, READING_SUMMARIES["argumentacion"]),
        "topic_es": topic_es.lower(),
        "topic_zh": topic_zh,
    }


def make_new_lesson(spec: dict[str, Any], template: dict[str, Any]) -> dict[str, Any]:
    number = spec["numero"]
    level = spec["nivel_hsk"]
    grammar = spec["enfoque"]
    entries = spec["vocabulario_objetivo"]
    words: dict[str, dict[str, str]] = {}
    for entry in entries:
        if entry.get("grafia_ambigua"):
            continue
        es, en, pinyin = gloss_of(entry)
        if not es:
            continue
        item: dict[str, str] = {"es": es}
        if en:
            item["en"] = en
        if pinyin:
            item["pron"] = pinyin
        words[entry["palabra"]] = item

    intro_es = f"Unidad HSK {level}: {spec['objetivo']['@es']}"
    intro_en = f"HSK {level} unit: study the assigned vocabulary and practise the target structure in context."
    explanation_es = f"{grammar['explanation_es']} La tabla reúne las entradas oficiales asignadas a esta unidad. Los ejercicios de vocabulario repasan el pinyin y, cuando la fuente aporta glosa española, también el significado."
    explanation_en = f"{grammar['explanation_en']} The table lists the official entries assigned to this unit. Vocabulary exercises review pinyin and, when the source provides a Spanish gloss, meaning as well."
    test_options = [
        {"texto": grammar["answer"], "correcta": True, "explicacion": tr("Es la forma que completa la estructura.", "This is the form that completes the structure.")},
        {"texto": grammar["wrong"], "correcta": False, "explicacion": tr("Esa forma expresa otra relación gramatical.", "That form expresses a different grammatical relationship.")},
    ]
    translation_wrong = "La frase describe un hecho que ocurrirá en otro lugar."
    if translation_wrong == grammar["es"]:
        translation_wrong = "La frase habla de una costumbre sin expresar relación entre ideas."
    vocab_tests: list[dict[str, Any]] = []
    pronounceable = [entry for entry in entries if entry.get("pinyin")]
    for offset, entry in enumerate(pronounceable[:2]):
        distractors = [other["pinyin"] for other in pronounceable if other["palabra"] != entry["palabra"] and other.get("pinyin")]
        choices = list(dict.fromkeys([entry["pinyin"], *distractors]))[:3]
        if len(choices) >= 2:
            vocab_tests.append({
                "tipo": "test",
                "id": f"zh{number:03d}-{6 + offset}",
                "pregunta": tr(f"¿Cómo se pronuncia {entry['palabra']}?", f"How is {entry['palabra']} pronounced?"),
                "opciones": [
                    {"texto": answer, "correcta": answer == entry["pinyin"]}
                    for answer in choices
                ],
            })
    glossed = [entry for entry in entries if entry.get("glosa_es")]
    for offset, entry in enumerate(glossed[:2]):
        distractors = [other["glosa_es"] for other in glossed if other["palabra"] != entry["palabra"] and other.get("glosa_es")]
        choices = list(dict.fromkeys([entry["glosa_es"], *distractors]))[:3]
        if len(choices) >= 2:
            vocab_tests.append({
                "tipo": "test",
                "id": f"zh{number:03d}-{8 + offset}",
                "pregunta": tr(f"¿Qué significa {entry['palabra']}?", f"What does {entry['palabra']} mean?"),
                "opciones": [
                    {"texto": answer, "correcta": answer == entry["glosa_es"]}
                    for answer in choices
                ],
            })
    study = contextual_study_content(spec)
    topic_es = study["topic_es"]
    if level == 4:
        writing_block = {
            "tipo": "escribir",
            "id": f"zh{number:03d}-5",
            "pregunta": tr(f"Escribe una frase en chino sobre «{topic_es}» usando {grammar['pattern']}.", f"Write a Chinese sentence about this lesson’s topic using {english_pattern(grammar['pattern'])}."),
            "respuestas": [grammar["zh"]],
            "explicacion": tr("Compara tu frase con el modelo y comprueba que ambos segmentos del conector estén presentes.", "Compare your sentence with the model and check that both parts of the connector are present."),
        }
    elif level == 5:
        paragraph_model = "".join(line["zh"] for line in study["reading"][:3])
        writing_block = {
            "tipo": "escribir",
            "id": f"zh{number:03d}-5",
            "autoevaluacion": True,
            "pregunta": tr(f"Redacta un texto breve en chino (aprox. 80–100 caracteres) sobre «{topic_es}». Expón una idea y apóyala con detalles de la lectura.", f"Write a short Chinese text (about 80–100 characters) on this lesson’s topic. State a point and support it with details from the reading."),
            "respuestas": [paragraph_model],
            "explicacion": tr("Comprueba que el texto responde al tema, desarrolla una idea con detalles pertinentes y enlaza las oraciones con claridad.", "Check that your text addresses the topic, develops one point with relevant details, and links the sentences clearly."),
        }
    else:
        writing_block = {
            "tipo": "escribir",
            "id": f"zh{number:03d}-5",
            "autoevaluacion": True,
            "pregunta": tr("Resume la lectura en chino con un texto cohesionado. Conserva las ideas esenciales y no añadas opiniones que el texto no sostenga.", "Summarize the reading in Chinese in a cohesive text. Keep the essential ideas and do not add opinions unsupported by the text."),
            "respuestas": [study["summary"]],
            "explicacion": tr("Comprueba que incluyes la idea central, conservas las relaciones entre sus puntos y expresas el contenido con tus propias palabras.", "Check that you include the main idea, preserve the relationships between the points, and express the content in your own words."),
        }
    blocks = [
        {
            "tipo": "explicacion",
            "titulo": tr(f"Estructura: {grammar['pattern']}", f"Pattern: {english_pattern(grammar['pattern'])}"),
            "texto": [tr(explanation_es, explanation_en)],
        },
        table_block(level, entries),
        {
            "tipo": "dialogo",
            "titulo": study["dialogue_title"],
            "frases": study["dialogue"],
        },
        {
            "tipo": "texto",
            "titulo": study["reading_title"],
            "frases": study["reading"],
        },
        {
            "tipo": "test",
            "id": f"zh{number:03d}-1",
            "pregunta": tr(f"¿Qué relación expresa {grammar['pattern']}?", f"What relationship does {english_pattern(grammar['pattern'])} express?"),
            "opciones": test_options,
        },
        *vocab_tests,
        {
            "tipo": "traduccion",
            "id": f"zh{number:03d}-2",
            "pregunta": tr("Elige la traducción que mejor refleja la frase.", "Choose the translation that best matches the sentence."),
            "frase": grammar["zh"],
            "opciones": [
                {"texto": tr(grammar["es"], grammar["en"]), "correcta": True},
                {"texto": tr(translation_wrong, "The sentence describes an event that will happen somewhere else."), "correcta": False},
            ],
        },
        {
            "tipo": "huecos",
            "id": f"zh{number:03d}-3",
            "pregunta": tr("Completa con el conector adecuado.", "Complete the sentence with the correct connector."),
            "frase": grammar["blank"],
            "opciones": [
                {"texto": grammar["answer"], "correcta": True},
                {"texto": grammar["wrong"], "correcta": False},
            ],
        },
        {
            "tipo": "ordenar",
            "id": f"zh{number:03d}-4",
            "pregunta": tr("Ordena los segmentos para reconstruir la frase.", "Put the segments in order to rebuild the sentence."),
            "frase": grammar["order"],
            "traduccion": tr(grammar["es"], grammar["en"]),
            "explicacion": tr("Respeta el orden del conector y sus dos partes.", "Keep the connector and its two parts in the correct order."),
        },
        writing_block,
    ]
    lesson = {key: value for key, value in template.items() if not key.startswith("_")}
    lesson.update({
        "capitulo": level,
        "numero_curso": number,
        "orden_curso": number,
        "titulo_zh": spec["titulo_zh"],
        "titulo_es": tr(spec["titulo_es"].get("@es", "") if isinstance(spec["titulo_es"], dict) else str(spec["titulo_es"]), f"HSK {level} · Unit {number}"),
        "intro": tr(intro_es, intro_en),
        "palabras": words,
        "bloques": blocks,
    })
    return lesson


def chapter_data() -> list[dict[str, Any]]:
    names = [
        ("HSK 1 · Primeros pasos", "HSK 1 · First steps", "基础入门", "Comunicación elemental, reconocimiento de caracteres, pronunciación, saludos e intercambios cotidianos.", "Basic communication, character recognition, pronunciation, greetings, and everyday exchanges."),
        ("HSK 2 · Vida cotidiana", "HSK 2 · Daily life", "日常生活", "Interacciones sencillas sobre horarios, familia, compras, desplazamientos y rutinas.", "Simple exchanges about schedules, family, shopping, travel, and routines."),
        ("HSK 3 · Comunicación básica", "HSK 3 · Basic communication", "基础交流", "Comunicación en situaciones habituales de la vida, los estudios y el trabajo; comprensión y producción de textos breves.", "Communication in familiar life, study, and work situations; understanding and producing short texts."),
        ("HSK 4 · Interacción ampliada", "HSK 4 · Broader interaction", "扩展交流", "Ampliar conversaciones sobre temas variados y enlazar ideas con mayor fluidez.", "Broaden conversations across varied topics and link ideas with greater fluency."),
        ("HSK 5 · Lectura y expresión", "HSK 5 · Reading and expression", "阅读与表达", "Comprender discursos más largos, formular opiniones y desenvolverse en contextos sociales, académicos y profesionales.", "Understand longer discourse, express opinions, and operate in social, academic, and professional contexts."),
        ("HSK 6 · Dominio avanzado", "HSK 6 · Advanced proficiency", "高级运用", "Interpretar textos extensos y expresar ideas complejas con precisión, cohesión y adecuación.", "Interpret extended texts and express complex ideas with accuracy, cohesion, and appropriateness."),
    ]
    return [
        {"numero": i, "titulo_zh": zh, "titulo_es": tr(es, en), "descripcion": tr(desc_es, desc_en), "nivel": f"HSK {i}"}
        for i, (es, en, zh, desc_es, desc_en) in enumerate(names, 1)
    ]


def write_existing_lesson(number: int, level: int, entries: list[dict[str, Any]]) -> None:
    path = LESSONS / f"{number:03d}.json"
    raw = json_read(path)
    if raw.get("capitulo") != level:
        raw["capitulo"] = level
    add_target_words(raw, entries)
    json_write(path, raw)


def exercise_index(raw: dict[str, Any], lesson_id: str) -> list[list[str]]:
    exercise_types = {"test", "traduccion", "huecos", "ordenar", "escribir"}
    ids: list[list[str]] = []
    for block in raw.get("bloques", []):
        if block.get("tipo") not in exercise_types:
            continue
        block_id = block.get("id")
        if block_id:
            value = str(block_id)
            ids.append([value if value.startswith("id|") else f"id|{value}"])
    return ids


def write_index() -> int:
    entries = []
    for number in range(1, 299):
        path = LESSONS / f"{number:03d}.json"
        raw = json_read(path)
        title_obj = raw.get("titulo_es", {})
        localized = title_obj if isinstance(title_obj, dict) else tr(str(title_obj), str(title_obj))
        entries.append({
            "id": f"{number:03d}",
            "titulo_es": raw.get("titulo_zh", str(title_obj)),
            "titulo": localized,
            "capitulo": raw.get("capitulo", 1),
            "orden_curso": raw.get("orden_curso", number),
            "numero_curso": raw.get("numero_curso", number),
            "ejercicios": exercise_index(raw, f"{number:03d}"),
            "audio": 1,
        })
    json_write(INDEX, {"version": 1, "lecciones": entries})
    return len(entries)


def make_plan(specs: dict[int, list[dict[str, Any]]], source_data: dict[str, Any]) -> dict[str, Any]:
    lessons: list[dict[str, Any]] = []
    for level in range(1, 7):
        for spec in specs[level]:
            entries = spec.get("vocabulario_objetivo", [])
            raw = json_read(LESSONS / f"{spec['numero']:03d}.json")
            actual = list(raw.get("palabras", {}).keys())
            lessons.append({
                "id": spec["id"],
                "numero_curso": spec["numero"],
                "nivel_hsk": level,
                "capitulo": level,
                "titulo_zh": spec.get("titulo_zh", ""),
                "titulo_es": spec.get("titulo_es", ""),
                "tema": spec.get("tema", ""),
                "objetivo": spec.get("objetivo", ""),
                "enfoque_gramatical": spec.get("gramatica", ""),
                "palabras_hsk_asignadas": entries,
                "palabras_hsk_formas_unicas": len(entries),
                "palabras_actuales_en_leccion": actual,
            })
    return {
        "version": 1,
        "esquema": "HSK 2.0 · seis niveles",
        "total_lecciones": len(lessons),
        "distribucion": [
            {"nivel": level, "desde": start, "hasta": end, "lecciones": end - start + 1,
             "entradas_oficiales_acumuladas": source_data["niveles"][level - 1]["vocabulario_acumulado_declarado"],
             "formas_nuevas_asignadas": sum(len(spec["vocabulario_objetivo"]) for spec in specs[level])}
            for level, (start, end) in COURSE_LEVELS.items()
        ],
        "criterio": (
            "Las 93 lecciones existentes se mantienen como base de HSK 1–3; se añaden a cada una las formas oficiales que faltaban. "
            "Las 205 unidades nuevas se reparten por nivel según el volumen de vocabulario nuevo y los objetivos de destreza. "
            "Las palabras se agrupan por tema cuando la fuente aporta glosa española o el término permite clasificarlo; "
            "los casos ambiguos se equilibran entre las unidades del nivel."
        ),
        "limitacion_de_fuente": source_data.get("nota_extraccion", ""),
        "fuentes": {
            "principal": source_data.get("fuente_principal", {}),
            "complementaria": source_data.get("fuente_complementaria", {}),
        },
        "lecciones": lessons,
    }


def main() -> None:
    if not TEMPLATE.exists():
        raise FileNotFoundError(f"Falta la plantilla JSON: {TEMPLATE}")
    if not SOURCE_DATA.exists():
        raise FileNotFoundError(f"Falta {SOURCE_DATA}; ejecuta preparar_vocabulario_hsk.py primero.")
    source_data = json_read(SOURCE_DATA)
    template = json_read(TEMPLATE)
    specs = build_lesson_specs()
    for level in range(1, 7):
        level_data = source_data["niveles"][level - 1]
        by_spelling = Counter(entry["palabra"] for entry in level_data["acumulado"])
        new_entries = [dict(entry, grafia_ambigua=by_spelling[entry["palabra"]] > 1) for entry in level_data["nuevas"]]
        assign_vocabulary(specs[level], new_entries)

    created = 0
    updated_existing = 0
    skipped = 0
    for level in range(1, 7):
        for spec in specs[level]:
            number = spec["numero"]
            path = LESSONS / f"{number:03d}.json"
            entries = spec["vocabulario_objetivo"]
            if number <= 93:
                write_existing_lesson(number, level, entries)
                updated_existing += 1
                continue
            if path.exists():
                existing = json_read(path)
                was_generated = any(is_generated_vocabulary_table(b) for b in existing.get("bloques", []))
                if existing.get("borrador") is not True and not was_generated:
                    skipped += 1
                    continue
            lesson = make_new_lesson(spec, template)
            json_write(path, lesson)
            created += 1

    json_write(CHAPTERS, chapter_data())
    plan = make_plan(specs, source_data)
    json_write(PLAN, plan)
    index_count = write_index()
    print(f"Lecciones 094–298 completadas ahora: {created}; completadas previamente y preservadas: {skipped}.")
    print(f"Lecciones 001–093 alineadas a los capítulos HSK y enriquecidas con vocabulario oficial: {updated_existing}.")
    print(f"Capítulos: 6; lecciones en el índice: {index_count}; plan: {PLAN}")
    for row in plan["distribucion"]:
        print(f"HSK {row['nivel']}: lecciones {row['desde']:03d}–{row['hasta']:03d} ({row['lecciones']}); palabras nuevas asignadas: {row['formas_nuevas_asignadas']}.")


if __name__ == "__main__":
    main()
