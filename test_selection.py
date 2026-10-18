import os
import sys
import unittest

os.environ.setdefault("QT_QPA_PLATFORM", "offscreen")

from PyQt6.QtCore import QPointF, QRectF, Qt
from PyQt6.QtGui import QColor, QMouseEvent, QPainterPath, QPen
from PyQt6.QtWidgets import QApplication

import main


class MockSignal:
    def connect(self, *_args, **_kwargs):
        pass


class MockSignals:
    def __getattr__(self, _name):
        return MockSignal()


app = QApplication.instance() or QApplication(sys.argv)


def make_stroke(x, y, width=40, height=40, color="#000000"):
    path = QPainterPath()
    path.addRect(QRectF(x, y, width, height))
    return {
        "path": path,
        "pen": QPen(QColor(color), 4),
        "mode": main.ToolMode.PEN,
    }


class SelectionTests(unittest.TestCase):
    def setUp(self):
        self.window = main.OverlayWindow(MockSignals())
        self.window.paths = [
            make_stroke(100, 100),
            make_stroke(220, 100),
        ]
        self.window.mode = main.ToolMode.SELECT

    def tearDown(self):
        self.window.close()

    def test_lasso_requires_visible_stroke_containment(self):
        inside = QPainterPath()
        inside.addRect(QRectF(90, 90, 60, 60))
        crossing = QPainterPath()
        crossing.addRect(QRectF(90, 90, 35, 60))

        self.assertTrue(self.window._path_fully_contained(inside, self.window.paths[0]))
        self.assertFalse(self.window._path_fully_contained(crossing, self.window.paths[0]))

    def test_recolor_is_undoable(self):
        self.window.selected_path_indices = [0]
        before = QColor(self.window.paths[0]["pen"].color())

        self.window.set_color("#ff0000")
        self.assertEqual(self.window.paths[0]["pen"].color(), QColor("#ff0000"))
        self.assertEqual(self.window.undo_history[-1]["type"], "recolor")

        self.window.undo()
        self.assertEqual(self.window.paths[0]["pen"].color(), before)

    def test_transform_is_one_undoable_gesture(self):
        self.window.selected_path_indices = [0]
        before = list(self.window._capture_selection_states([0]))
        self.window.selection_start_states = list(before)
        self.window.paths[0]["path"] = self.window.paths[0]["path"].translated(25, 10)
        self.window.paths[0]["obb"] = self.window.paths[0]["path"].boundingRect()

        self.window._record_selection_transform()
        self.assertEqual(self.window.undo_history[-1]["type"], "transform")

        self.window.undo()
        self.assertEqual(
            self.window.paths[0]["path"].boundingRect(),
            before[0]["path"].boundingRect(),
        )

    def test_corner_scale_uses_opposite_anchor(self):
        self.window.selected_path_indices = [0]
        self.window._recalculate_master_obb()
        self.window._begin_selection_scale(
            type("Event", (), {
                "position": lambda _self: QPointF(100, 100),
                "accept": lambda _self: None,
            })(),
            0,
        )
        self.assertEqual(self.window.selection_scale_handle, 0)
        self.assertEqual(self.window.selection_action, "scale")

    def test_mouse_pause_does_not_start_mid_stroke_shape_detection(self):
        self.window.mode = main.ToolMode.PEN
        press = QMouseEvent(
            QMouseEvent.Type.MouseButtonPress,
            QPointF(20, 20),
            Qt.MouseButton.LeftButton,
            Qt.MouseButton.LeftButton,
            Qt.KeyboardModifier.NoModifier,
        )
        move = QMouseEvent(
            QMouseEvent.Type.MouseMove,
            QPointF(40, 40),
            Qt.MouseButton.NoButton,
            Qt.MouseButton.LeftButton,
            Qt.KeyboardModifier.NoModifier,
        )

        self.window.mousePressEvent(press)
        self.window.mouseMoveEvent(move)

        self.assertTrue(self.window.drawing)
        self.assertGreaterEqual(len(self.window.raw_points), 2)

        release = QMouseEvent(
            QMouseEvent.Type.MouseButtonRelease,
            QPointF(60, 60),
            Qt.MouseButton.LeftButton,
            Qt.MouseButton.NoButton,
            Qt.KeyboardModifier.NoModifier,
        )
        self.window.mouseReleaseEvent(release)

    def test_wheel_scroll_requires_modifier_and_not_active_drawing(self):
        self.window.mode = main.ToolMode.PEN
        forwarded = []
        self.window._forward_wheel_to_underlying = lambda *args: forwarded.append(args) or True

        class WheelEvent:
            def __init__(self, modifiers, buttons=Qt.MouseButton.NoButton):
                self._modifiers = modifiers
                self._buttons = buttons

            def modifiers(self):
                return self._modifiers

            def buttons(self):
                return self._buttons

            def angleDelta(self):
                return QPointF(0, 120)

            def accept(self):
                pass

            def ignore(self):
                pass

        self.window.wheelEvent(WheelEvent(Qt.KeyboardModifier.ControlModifier))
        self.assertEqual(len(forwarded), 1)

        forwarded.clear()
        self.window.wheelEvent(WheelEvent(Qt.KeyboardModifier.NoModifier))
        self.assertEqual(forwarded, [])

        self.window.wheelEvent(WheelEvent(
            Qt.KeyboardModifier.ControlModifier,
            Qt.MouseButton.LeftButton,
        ))
        self.assertEqual(forwarded, [])


if __name__ == "__main__":
    unittest.main()
