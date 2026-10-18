import sys
from PyQt6.QtWidgets import QApplication
from PyQt6.QtCore import QPointF, Qt
from PyQt6.QtGui import QMouseEvent, QPainterPath, QPen
import main

class MockSignal:
    def connect(self, *args, **kwargs):
        pass
    def emit(self, *args, **kwargs):
        pass

class MockSignals:
    def __getattr__(self, name):
        return MockSignal()

app = QApplication(sys.argv)
signals = MockSignals()
window = main.OverlayWindow(signals)
window.ink_visible = True
window.mode = main.ToolMode.PEN

# Mock a path
path = QPainterPath()
path.addRect(10, 10, 100, 100)
window.paths.append({'path': path, 'pen': QPen(), 'mode': main.ToolMode.PEN})
window.selected_path_indices = [0]
window._recalculate_master_obb()
window.mode = main.ToolMode.SELECT
failures = []

# Select mode, simulate click on rotate handle
# First calculate rot_handle
rot_center, del_center = window._get_selection_handles(window.paths[0].get('obb', main.QPolygonF(path.boundingRect())))
print("rot_center:", rot_center)
print("del_center:", del_center)

event = QMouseEvent(QMouseEvent.Type.MouseButtonPress, rot_center, Qt.MouseButton.LeftButton, Qt.MouseButton.LeftButton, Qt.KeyboardModifier.NoModifier)
try:
    window.mousePressEvent(event)
    print("Mouse press passed")
except Exception as e:
    import traceback
    traceback.print_exc()
    failures.append(("Mouse press", e))

# Simulate move
try:
    move_event = QMouseEvent(QMouseEvent.Type.MouseMove, QPointF(rot_center.x() + 10, rot_center.y() + 10), Qt.MouseButton.LeftButton, Qt.MouseButton.LeftButton, Qt.KeyboardModifier.NoModifier)
    window.mouseMoveEvent(move_event)
    print("Mouse move passed")
except Exception as e:
    import traceback
    traceback.print_exc()
    failures.append(("Mouse move", e))

# Exercise Qt's real paint lifecycle instead of calling paintEvent directly.
try:
    window.show()
    app.processEvents()
    window.repaint()
    app.processEvents()
    print("Paint passed")
except Exception as e:
    import traceback
    traceback.print_exc()
    failures.append(("Paint", e))

# Simulate delete handle
event2 = QMouseEvent(QMouseEvent.Type.MouseButtonPress, del_center, Qt.MouseButton.LeftButton, Qt.MouseButton.LeftButton, Qt.KeyboardModifier.NoModifier)
try:
    window.mousePressEvent(event2)
    print("Mouse press 2 passed")
except Exception as e:
    import traceback
    traceback.print_exc()
    failures.append(("Mouse press 2", e))

window.close()
app.quit()
if failures:
    print(f"{len(failures)} smoke test step(s) failed")
    sys.exit(1)
sys.exit(0)
